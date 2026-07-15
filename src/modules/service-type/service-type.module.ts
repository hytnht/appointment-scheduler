import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceType } from './entities/service-type.entity';
import { ServiceTypeService } from './service-type.service';
import { ServiceTypeController } from './service-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceType])],
  providers: [ServiceTypeService],
  controllers: [ServiceTypeController],
  exports: [ServiceTypeService],
})
export class ServiceTypeModule {}
