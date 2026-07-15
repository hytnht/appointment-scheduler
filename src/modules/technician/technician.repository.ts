import { Injectable } from '@nestjs/common';
import { Technician } from './entities/technician.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TechnicianRepository extends Repository<Technician> {
  constructor(private readonly dataSource: DataSource) {
    super(Technician, dataSource.createEntityManager());
  }

  addServiceType(
    technicianId: number,
    serviceTypeId: number | number[],
  ): Promise<void> {
    return this.dataSource
      .createQueryBuilder()
      .relation(Technician, 'serviceType')
      .of(technicianId)
      .add(serviceTypeId);
  }

  removeServiceType(
    technicianId: number,
    serviceTypeId: number,
  ): Promise<void> {
    return this.dataSource
      .createQueryBuilder()
      .relation(Technician, 'serviceType')
      .of(technicianId)
      .remove(serviceTypeId);
  }
}
