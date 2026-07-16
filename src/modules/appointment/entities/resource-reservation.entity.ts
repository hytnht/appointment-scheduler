import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { EResourceType } from '../constants/appointment.constant';
import { Appointment } from './appointment.entity';

@Entity()
@Index('sch_resourceReservation_NC_appointmentId', ['appointmentId'])
export class ResourceReservation {
  @PrimaryColumn({ name: 'resource_type', type: 'nvarchar', length: 10 })
  resourceType: EResourceType;

  @PrimaryColumn({ name: 'resource_id', type: 'int', unsigned: true })
  resourceId: number;

  @PrimaryColumn({ name: 'slot_start', type: 'datetime' })
  slotStart: Date;

  @ManyToOne(() => Appointment, (appointment) => appointment.reservations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id', type: 'int', unsigned: true })
  appointmentId: number;
}
