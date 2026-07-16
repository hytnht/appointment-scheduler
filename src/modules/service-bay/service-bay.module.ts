import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceBay } from './entities/service-bay.entity';
import { ServiceBayService } from './service-bay.service';
import { ServiceBayController } from './service-bay.controller';
import { DealershipModule } from '../dealership/dealership.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceBay]), DealershipModule],
  providers: [ServiceBayService],
  controllers: [ServiceBayController],
  exports: [ServiceBayService],
})
export class ServiceBayModule {}
