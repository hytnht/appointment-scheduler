import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';

@Entity()
export class Vehicle extends BaseEntity {
  @Column({ type: 'nvarchar', length: 17, unique: true })
  vin: string;

  @Column({ type: 'nvarchar', length: 100 })
  make: string;

  @Column({ type: 'nvarchar', length: 100 })
  model: string;

  @Column({ type: 'smallint', unsigned: true })
  year: number;

  @ManyToOne(() => Customer, { createForeignKeyConstraints: false })
  customer: Customer;
  @Column({ type: 'int', unsigned: true })
  customerId: number;
}
