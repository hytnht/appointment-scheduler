import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { Appointment } from './appointment.entity';
import { EResourceType } from '../contants/appointment.contanst';

@Entity()
@Index('idx_appointment_id', ['appointmentId'])
export class ResourceReservation {
  @PrimaryColumn({ name: 'resource_type', type: 'nvarchar', length: 10 })
  resourceType: EResourceType;

  @PrimaryColumn({ name: 'resource_id', type: 'int', unsigned: true })
  resourceId: number;

  @PrimaryColumn({ name: 'slot_start', type: 'datetime' })
  slotStart: Date;

  @ManyToOne(() => Appointment, { createForeignKeyConstraints: false })
  appointment: Appointment;

  @Column({ name: 'appointment_id', type: 'int', unsigned: true })
  appointmentId: number;
}
