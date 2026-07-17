import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ServiceBay } from '../service-bay/entities/service-bay.entity';
import { Technician } from '../technician/entities/technician.entity';
import { EResourceType } from './constants/appointment.constant';
import { Appointment } from './entities/appointment.entity';
import { ResourceReservation } from './entities/resource-reservation.entity';

@Injectable()
export class AppointmentRepository extends Repository<Appointment> {
  constructor(private readonly dataSource: DataSource) {
    super(Appointment, dataSource.createEntityManager());
  }

  async lockResource(id: number, type: EResourceType): Promise<Technician | ServiceBay | null> {
    const entity = { [EResourceType.BAY]: ServiceBay, [EResourceType.TECH]: Technician };
    return this.manager
      .createQueryBuilder(entity[type], 'resource')
      .where('resource.id = :id', { id })
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .getOne();
  }

  search(params: {
    dealershipId?: number;
    vehicleId?: number;
    skip: number;
    take: number;
  }): Promise<[Appointment[], number]> {
    const { dealershipId, vehicleId, skip, take } = params;
    const qb = this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.dealership', 'dealership')
      .leftJoinAndSelect('appointment.vehicle', 'vehicle')
      .leftJoinAndSelect('appointment.technician', 'technician')
      .leftJoinAndSelect('appointment.serviceBay', 'serviceBay')
      .leftJoinAndSelect('appointment.serviceType', 'serviceType')
      .orderBy('appointment.start_at', 'DESC')
      .skip(skip)
      .take(take);

    if (dealershipId) qb.andWhere('appointment.dealership_id = :dealershipId', { dealershipId });
    if (vehicleId) qb.andWhere('appointment.vehicle_id = :vehicleId', { vehicleId });

    return qb.getManyAndCount();
  }

  async createAppointment(
    appointment: Partial<Appointment>,
    reservations: Partial<ResourceReservation>[],
  ): Promise<Appointment> {
    const savedAppointment = await this.save(appointment);

    await this.manager.getRepository(ResourceReservation).insert(
      reservations.map((reservation) => ({
        ...reservation,
        appointmentId: savedAppointment.id,
      })),
    );

    return savedAppointment;
  }
}
