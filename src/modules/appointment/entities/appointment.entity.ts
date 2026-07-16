import { BaseEntity } from '@src/database/entities/base.entity';
import { Dealership } from '@src/modules/dealership/entities/dealership.entity';
import { ServiceBay } from '@src/modules/service-bay/entities/service-bay.entity';
import { ServiceType } from '@src/modules/service-type/entities/service-type.entity';
import { Technician } from '@src/modules/technician/entities/technician.entity';
import { Vehicle } from '@src/modules/vehicle/entities/vehicle.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import {
  DUPLICATE_VEHICLE_BOOKING_INDEX,
  EAppointmentStatus,
} from '../constants/appointment.constant';
import { ResourceReservation } from './resource-reservation.entity';

@Entity()
@Unique(DUPLICATE_VEHICLE_BOOKING_INDEX, ['vehicleId', 'startAt', 'active'])
@Index('sch_appointment_NC_dealershipId', ['dealershipId'])
export class Appointment extends BaseEntity {
  @ManyToOne(() => Dealership, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;
  @Column({ name: 'dealership_id', type: 'int', unsigned: true })
  dealershipId: number;

  @ManyToOne(() => Vehicle, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
  @Column({ name: 'vehicle_id', type: 'int', unsigned: true })
  vehicleId: number;

  @ManyToOne(() => Technician, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'technician_id' })
  technician: Technician;
  @Column({ name: 'technician_id', type: 'int', unsigned: true })
  technicianId: number;

  @ManyToOne(() => ServiceBay, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'service_bay_id' })
  serviceBay: ServiceBay;
  @Column({ name: 'service_bay_id', type: 'int', unsigned: true })
  serviceBayId: number;

  @ManyToOne(() => ServiceType, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;
  @Column({ name: 'service_type_id', type: 'int', unsigned: true })
  serviceTypeId: number;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'datetime' })
  endAt: Date;

  @Column({ type: 'tinyint' })
  status: EAppointmentStatus;

  @Column({
    type: 'tinyint',
    nullable: true,
    select: false,
    insert: false,
    update: false,
    asExpression: `if(status <> ${EAppointmentStatus.CANCELLED}, 1, NULL)`,
    generatedType: 'STORED',
  })
  active: number | null;

  @OneToMany(() => ResourceReservation, (reservation) => reservation.appointment)
  reservations: ResourceReservation[];
}
