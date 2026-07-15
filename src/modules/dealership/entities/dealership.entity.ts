import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Dealership extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'varchar', length: 255 })
  address: string;
  @Column({ type: 'varchar', length: 100 })
  city: string;
  @Column({ type: 'varchar', length: 100 })
  country: string;
  @Column({ type: 'varchar', length: 64 })
  timezone: string;
  @Column({ name: 'open_time', type: 'time' })
  openTime: string;
  @Column({ name: 'close_time', type: 'time' })
  closeTime: string;
}
