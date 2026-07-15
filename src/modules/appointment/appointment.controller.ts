import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { GetAvailabilityDto } from './dtos/get-availability.dto';

@Controller('dealerships')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get(':id/availability')
  getAvailability(
    @Param('id') dealershipId: number,
    @Query() { serviceTypeId, date }: GetAvailabilityDto,
  ): Promise<string[]> {
    return this.appointmentService.getAvailability(dealershipId, serviceTypeId, date);
  }
}
