import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealershipModule } from '../dealership/dealership.module';
import { ServiceTypeModule } from '../service-type/service-type.module';
import { ServiceBayModule } from '../service-bay/service-bay.module';
import { TechnicianModule } from '../technician/technician.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entities/appointment.entity';
import { ResourceReservation } from './entities/resource-reservation.entity';
import { VehicleModule } from '../vehicle/vehicle.module';
import { AppointmentRepository } from './appointment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, ResourceReservation]),
    DealershipModule,
    ServiceTypeModule,
    ServiceBayModule,
    TechnicianModule,
    VehicleModule,
  ],
  providers: [AppointmentService, AppointmentRepository],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {}
