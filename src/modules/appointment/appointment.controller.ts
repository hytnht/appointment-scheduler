import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { GetAvailabilityDto } from './dtos/get-availability.dto';
import { SearchAppointmentDto } from './dtos/search-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { AppointmentSearchResult } from './interfaces/appointment-search.type';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  search(@Query() query: SearchAppointmentDto): Promise<AppointmentSearchResult> {
    return this.appointmentService.search(query);
  }

  @Get('availability/:id')
  getAvailability(
    @Param('id') dealershipId: number,
    @Query() { serviceTypeId, date }: GetAvailabilityDto,
  ): Promise<string[]> {
    return this.appointmentService.getAvailability(dealershipId, serviceTypeId, date);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentService.createAppointment(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Appointment> {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  patch(@Param('id') id: number): Promise<Appointment> {
    return this.appointmentService.cancelAppointment(id);
  }
}
