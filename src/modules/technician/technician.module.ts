import { Module } from '@nestjs/common';
import { DealershipModule } from '../dealership/dealership.module';
import { ServiceTypeModule } from '../service-type/service-type.module';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { TechnicianRepository } from './technician.repository';

@Module({
  imports: [DealershipModule, ServiceTypeModule],
  providers: [TechnicianService, TechnicianRepository],
  controllers: [TechnicianController],
  exports: [TechnicianService],
})
export class TechnicianModule {}
