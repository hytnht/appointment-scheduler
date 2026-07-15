import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Dealership } from '../../dealership/entities/dealership.entity';

@Entity()
export class ServiceBay extends BaseEntity {
  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => Dealership, { createForeignKeyConstraints: false })
  dealership: Dealership;

  @Column({ type: 'int', unsigned: true })
  dealershipId: number;
}
