import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Dealership } from '../../dealership/entities/dealership.entity';

@Entity()
@Index('sch_service_bay_NC_dealershipId', ['dealershipId'])
export class ServiceBay extends BaseEntity {
  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => Dealership, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;

  @Column({ name: 'dealership_id', type: 'int', unsigned: true })
  dealershipId: number;
}
