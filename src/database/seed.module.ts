import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from '@src/configs/app.config';
import configSchema from '@src/configs/config.schema';
import { DatabaseModule } from '@src/database/database.module';
import { Customer } from '@src/modules/customer/entities/customer.entity';
import { Dealership } from '@src/modules/dealership/entities/dealership.entity';
import { ServiceBay } from '@src/modules/service-bay/entities/service-bay.entity';
import { ServiceType } from '@src/modules/service-type/entities/service-type.entity';
import { Technician } from '@src/modules/technician/entities/technician.entity';
import { Vehicle } from '@src/modules/vehicle/entities/vehicle.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: configSchema,
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Dealership, ServiceBay, Technician, ServiceType, Customer, Vehicle]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
