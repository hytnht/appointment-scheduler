import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceBayService } from '../service-bay/service-bay.service';
import { TechnicianService } from '../technician/technician.service';
import { getDealershipSlots, getReserveKey, hasFreeResource } from './appointment.helper';
import { EResourceType } from './contants/appointment.contanst';
import { ResourceReservation } from './entities/resource-reservation.entity';
import { toLocal } from '@src/shared/utils/date.helper';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(ResourceReservation)
    private readonly reservationRepo: Repository<ResourceReservation>,
    private readonly serviceBayService: ServiceBayService,
    private readonly technicianService: TechnicianService,
  ) {}

  async getAvailability(
    dealershipId: number,
    serviceTypeId: number,
    date: string,
  ): Promise<string[]> {
    const [technicians, bays] = await Promise.all([
      this.technicianService.findActive({ serviceTypeId, dealershipId }),
      this.serviceBayService.findByDealershipId(dealershipId),
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

    const slots = getDealershipSlots(dealership, date);
    if (!slots.length) return [];

    const reservations = await this.reservationRepo.find({
      where: {
        resourceId: In([...qualifiedTechIds, ...activeBayIds]),
        slotStart: In(slots),
      },
    });
    const blocked = new Set(reservations.map(getReserveKey));
    const filterFn = hasFreeResource(blocked, durationMinutes, {
      [EResourceType.TECH]: qualifiedTechIds,
      [EResourceType.BAY]: activeBayIds,
    });
    return slots.filter(filterFn).map((slot) => toLocal(slot, timezone).toISOString());
  }
}
