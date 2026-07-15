import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs, { toLocal, toUtc } from '@src/shared/utils/date.helper';
import { MysqlError } from 'mysql';
import { In, Not, QueryFailedError, Repository } from 'typeorm';
import { IsolationLevel, Propagation, Transactional } from 'typeorm-transactional';
import { DealershipService } from '../dealership/dealership.service';
import { Dealership } from '../dealership/entities/dealership.entity';
import { ServiceBayService } from '../service-bay/service-bay.service';
import { ServiceTypeService } from '../service-type/service-type.service';
import { TechnicianService } from '../technician/technician.service';
import { VehicleService } from '../vehicle/vehicle.service';
import {
  getDealershipSlots,
  getFreeResources,
  getReserveKey,
  hasFreeResource,
  isGridAligned,
  mergeSlots,
  pickByLowestLoad,
} from './appointment.helper';
import { AppointmentRepository } from './appointment.repository';
import {
  DUPLICATE_VEHICLE_BOOKING_INDEX,
  EAppointmentStatus,
  EResourceType,
} from './constants/appointment.constant';
import { AppointmentErrorMessages } from './constants/appointment.message';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { SearchAppointmentDto } from './dtos/search-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { ResourceReservation } from './entities/resource-reservation.entity';
import { AppointmentSearchResult } from './interfaces/appointment-search.type';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepo: AppointmentRepository,
    @InjectRepository(ResourceReservation)
    private readonly reservationRepo: Repository<ResourceReservation>,
    private readonly dealershipService: DealershipService,
    private readonly vehicleService: VehicleService,
    private readonly serviceBayService: ServiceBayService,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly technicianService: TechnicianService,
  ) {}

  async getAvailability(
    dealershipId: number,
    serviceTypeId: number,
    date: string,
  ): Promise<string[]> {
    const [technicians, bays] = await Promise.all([
      this.technicianService.findBy({ serviceTypeId, dealershipId }, true),
      this.serviceBayService.findByDealership(dealershipId, true),
    ]);

    const qualifiedTechIds = technicians.map((tech) => tech.id);
    const activeBayIds = bays.map((bay) => bay.id);
    if (!qualifiedTechIds.length || !activeBayIds.length) return [];

    const [
      {
        dealership,
        dealership: { timezone },
        serviceType,
      },
    ] = technicians;
    const { durationMinutes } = serviceType.find(({ id }) => id === serviceTypeId)!;

    const slots = getDealershipSlots(dealership, date, durationMinutes);
    if (!slots.length) return [];

    const reservations = await this.getReservations([...qualifiedTechIds, ...activeBayIds], slots);
    const blocked = new Set(reservations.map(getReserveKey));
    const filterFn = hasFreeResource(blocked, durationMinutes, {
      [EResourceType.TECH]: qualifiedTechIds,
      [EResourceType.BAY]: activeBayIds,
    });
    return slots.filter(filterFn).map((slot) => toLocal(slot, timezone).toISOString());
  }

  async search(query: SearchAppointmentDto): Promise<AppointmentSearchResult> {
    const { dealershipId, vehicleId, page, limit } = query;

    const [items, total] = await this.appointmentRepo.search({
      dealershipId,
      vehicleId,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: {
        dealership: true,
        vehicle: { customer: true },
        technician: true,
        serviceBay: true,
        serviceType: true,
        reservations: true,
      },
    });
    if (!appointment) throw new NotFoundException(AppointmentErrorMessages.NOT_FOUND);
    return appointment;
  }

  async exists(id: number): Promise<void> {
    const exists = await this.appointmentRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(AppointmentErrorMessages.NOT_FOUND);
  }

  async getReservations(resourceIds: number[], slots: Date[]): Promise<ResourceReservation[]> {
    const reservations = await this.reservationRepo.find({
      where: {
        resourceId: In(resourceIds),
        slotStart: In(slots),
      },
    });
    return reservations;
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    const { dealershipId, serviceTypeId, vehicleId, startAt } = dto;

    const [dealership, { durationMinutes }, { customerId }] = await Promise.all([
      this.dealershipService.findOne(dealershipId),
      this.serviceTypeService.findOne(serviceTypeId),
      this.vehicleService.findOne(vehicleId),
    ]);

    const { startAtUtc, endAtUtc } = this.validateTime(startAt, dealership, durationMinutes);

    const isExisted = await this.appointmentRepo.exists({
      where: { vehicleId, startAt: startAtUtc, status: Not(EAppointmentStatus.CANCELLED) },
    });
    if (isExisted) throw new ConflictException(AppointmentErrorMessages.DUPLICATE_VEHICLE_BOOKING);

    const slots = mergeSlots(startAtUtc, durationMinutes);

    const [technicians, bays] = await Promise.all([
      this.technicianService.findBy({ serviceTypeId, dealershipId }, true),
      this.serviceBayService.findByDealership(dealershipId, true),
    ]);

    if (!technicians.length || !bays.length)
      throw new NotFoundException(AppointmentErrorMessages.NO_RESOURCE);

    const techIds = technicians.map(({ id }) => id);
    const bayIds = bays.map(({ id }) => id);
    const reservations = await this.getReservations([...techIds, ...bayIds], slots);
    const blocked = new Set(reservations.map(getReserveKey));

    const freeResources = getFreeResources(
      { [EResourceType.TECH]: techIds, [EResourceType.BAY]: bayIds },
      slots,
      blocked,
    );
    if (!freeResources[EResourceType.TECH]?.length || !freeResources[EResourceType.BAY]?.length)
      throw new NotFoundException(AppointmentErrorMessages.NO_RESOURCE);

    const { lowestLoad, remaining } = pickByLowestLoad(freeResources, reservations);
    const data = {
      dealershipId,
      customerId,
      vehicleId,
      serviceTypeId,
      startAt: startAtUtc,
      endAt: endAtUtc,
      status: EAppointmentStatus.CONFIRMED,
    };

    const appointment = await this.bookSlots(lowestLoad, slots, data);
    return appointment || (await this.bookSlots(remaining, slots, data));
  }

  @Transactional()
  async cancelAppointment(id: number): Promise<Appointment> {
    await this.exists(id);
    await this.reservationRepo.delete({ appointmentId: id });
    return await this.appointmentRepo.save({ id, status: EAppointmentStatus.CANCELLED });
  }

  async bookSlots(
    candidates: Record<EResourceType, number[]>,
    slots: Date[],
    data: Partial<Appointment>,
  ): Promise<Appointment> {
    const { [EResourceType.TECH]: techCandidates, [EResourceType.BAY]: bayCandidates } = candidates;
    for (const techId of techCandidates)
      for (const bayId of bayCandidates) {
        try {
          const appointment = await this.reserveResources({ techId, bayId }, slots, data);
          if (appointment) return appointment;
        } catch (error) {
          const { driverError: { sqlMessage, code, errno } = {} } =
            error as QueryFailedError<MysqlError>;

          if (sqlMessage?.includes(DUPLICATE_VEHICLE_BOOKING_INDEX))
            throw new ConflictException(AppointmentErrorMessages.DUPLICATE_VEHICLE_BOOKING);

          if (code === 'ER_DUP_ENTRY' || errno === 1062) continue; // Ignore duplicate entry error and try next candidate
          throw error;
        }
      }
    throw new ConflictException(AppointmentErrorMessages.NO_RESOURCE);
  }

  @Transactional({
    propagation: Propagation.REQUIRES_NEW,
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  async reserveResources(
    { bayId, techId }: { bayId: number; techId: number },
    slots: Date[],
    data: Partial<Appointment>,
  ): Promise<Appointment | null> {
    const [lockedTech, lockedBay] = await Promise.all([
      this.appointmentRepo.lockResource(techId, EResourceType.TECH),
      this.appointmentRepo.lockResource(bayId, EResourceType.BAY),
    ]);
    if (!lockedTech || !lockedBay) return null;

    const reservations = slots.flatMap((slotStart) => [
      {
        resourceType: EResourceType.TECH,
        resourceId: techId,
        slotStart,
      },
      {
        resourceType: EResourceType.BAY,
        resourceId: bayId,
        slotStart,
      },
    ]);

    return await this.appointmentRepo.createAppointment(
      {
        ...data,
        technicianId: techId,
        serviceBayId: bayId,
      },
      reservations,
    );
  }

  private validateTime(startAt: string, dealership: Dealership, durationMinutes: number) {
    // Time must be grid-aligned
    const startAtUtc = toUtc(startAt);
    if (!isGridAligned(startAtUtc))
      throw new BadRequestException(AppointmentErrorMessages.INVALID_GRID_ALIGNED);

    // Time must be within business hours
    const { openTime, closeTime, timezone } = dealership;
    const dateStr = dayjs(startAtUtc).format('YYYY-MM-DD');
    const openTimeUtc = toUtc(dateStr, openTime, timezone);
    const closeTimeUtc = toUtc(dateStr, closeTime, timezone);
    const endAtUtc = dayjs(startAtUtc).add(durationMinutes, 'minute').toDate();
    if (startAtUtc < openTimeUtc || endAtUtc > closeTimeUtc)
      throw new BadRequestException(AppointmentErrorMessages.INVALID_BUSINESS_HOURS);

    return { startAtUtc, endAtUtc };
  }
}
