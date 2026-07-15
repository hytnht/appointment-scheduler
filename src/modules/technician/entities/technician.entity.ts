import { BaseEntity } from '@src/database/entities/base.entity';
import { ServiceType } from '@src/modules/service-type/entities/service-type.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Dealership } from '../../dealership/entities/dealership.entity';

@Entity()
export class Technician extends BaseEntity {
  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => Dealership, { createForeignKeyConstraints: false })
  dealership: Dealership;
  @Column({ type: 'int', unsigned: true })
  dealershipId: number;

  @ManyToMany(() => ServiceType, {
    createForeignKeyConstraints: false,
    cascade: false,
  })
  @JoinTable({
    name: 'technician_service_type',
    joinColumn: {
      name: 'technicianId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'serviceTypeId',
      referencedColumnName: 'id',
    },
  })
  serviceType: ServiceType[];
}
