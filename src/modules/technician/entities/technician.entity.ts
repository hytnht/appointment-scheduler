import { BaseEntity } from '@src/database/entities/base.entity';
import { ServiceType } from '@src/modules/service-type/entities/service-type.entity';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Dealership } from '../../dealership/entities/dealership.entity';

@Entity()
@Index('sch_technician_NC_dealershipId', ['dealershipId'])
export class Technician extends BaseEntity {
  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => Dealership, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'dealership_id' })
  dealership: Dealership;
  @Column({ name: 'dealership_id', type: 'int', unsigned: true })
  dealershipId: number;

  @ManyToMany(() => ServiceType, {
    createForeignKeyConstraints: false,
    cascade: false,
  })
  @JoinTable({
    name: 'technician_service_type',
    joinColumn: {
      name: 'technician_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'service_type_id',
      referencedColumnName: 'id',
    },
  })
  serviceType: ServiceType[];
}
