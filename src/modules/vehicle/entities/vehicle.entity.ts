import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity, ForeignKey, ManyToOne } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';

@Entity()
export class Vehicle extends BaseEntity {
  @Column({ type: 'bigint' })
  @ForeignKey(() => Customer)
  customerId: number;

  @Column({ type: 'varchar', length: 17, unique: true })
  vin: string;

  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @ManyToOne(() => Customer)
  customer: Customer;
}
