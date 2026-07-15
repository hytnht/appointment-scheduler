import { BaseEntity } from '@src/database/entities/base.entity';
import { Customer } from '@src/modules/customer/entities/customer.entity';
import { Dealership } from '@src/modules/dealership/entities/dealership.entity';
import { ServiceBay } from '@src/modules/service-bay/entities/service-bay.entity';
import { ServiceType } from '@src/modules/service-type/entities/service-type.entity';
import { Technician } from '@src/modules/technician/entities/technician.entity';
import { Vehicle } from '@src/modules/vehicle/entities/vehicle.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { EAppointmentStatus } from '../contants/appointment.contanst';

@Entity()
@Unique('uq_vehicle_start', ['vehicleId', 'startAt'])
export class Appointment extends BaseEntity {
  @ManyToOne(() => Dealership, { createForeignKeyConstraints: false })
  dealership: Dealership;
  @Column({ name: 'dealership_id', type: 'int', unsigned: true })
  dealershipId: number;

  @ManyToOne(() => Customer, { createForeignKeyConstraints: false })
  customer: Customer;
  @Column({ name: 'customer_id', type: 'int', unsigned: true })
  customerId: number;

  @ManyToOne(() => Vehicle, { createForeignKeyConstraints: false })
  vehicle: Vehicle;
  @Column({ name: 'vehicle_id', type: 'int', unsigned: true })
  vehicleId: number;

  @ManyToOne(() => Technician, { createForeignKeyConstraints: false })
  technician: Technician;
  @Column({ name: 'technician_id', type: 'int', unsigned: true })
  technicianId: number;

  @ManyToOne(() => ServiceBay, { createForeignKeyConstraints: false })
  serviceBay: ServiceBay;
  @Column({ name: 'service_bay_id', type: 'int', unsigned: true })
  serviceBayId: number;
  @ManyToMany(() => ServiceType, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'appointment_service_type',
    joinColumn: {
      name: 'appointmentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'serviceTypeId',
      referencedColumnName: 'id',
    },
  })
  serviceTypes: ServiceType[];

  @Column({ name: 'start_at', type: 'datetime' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'datetime' })
  endAt: Date;

  @Column({ type: 'tinyint' })
  status: EAppointmentStatus;
}
