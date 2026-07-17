import { BaseEntity } from '@src/database/entities/base.entity';
import { Technician } from '@src/modules/technician/entities/technician.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity()
export class ServiceType extends BaseEntity {
  @Column({ type: 'nvarchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'duration_minutes', type: 'smallint', unsigned: true })
  durationMinutes: number;
  @ManyToMany(() => Technician, { createForeignKeyConstraints: true })
  technician: Technician[];
}
