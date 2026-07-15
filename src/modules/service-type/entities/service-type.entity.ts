import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ServiceType extends BaseEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;
}
