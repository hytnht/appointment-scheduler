import { BaseEntity } from '@src/database/entities/base.entity';
import { ServiceBay } from '@src/modules/service-bay/entities/service-bay.entity';
import { Technician } from '@src/modules/technician/entities/technician.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Dealership extends BaseEntity {
  @Column({ type: 'nvarchar', length: 255 })
  name: string;
  @Column({ type: 'nvarchar', length: 255 })
  address: string;
  @Column({ type: 'nvarchar', length: 100 })
  city: string;
  @Column({ type: 'nvarchar', length: 100 })
  country: string;
  @Column({ type: 'nvarchar', length: 64 })
  timezone: string;
  @Column({ name: 'open_time', type: 'time' })
  openTime: string;
  @Column({ name: 'close_time', type: 'time' })
  closeTime: string;
  @OneToMany(() => ServiceBay, (serviceBay) => serviceBay.dealership)
  serviceBays: ServiceBay[];
  @OneToMany(() => Technician, (technician) => technician.dealership)
  technicians: Technician[];
}
