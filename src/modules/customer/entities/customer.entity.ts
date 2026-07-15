import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Customer extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;
}
