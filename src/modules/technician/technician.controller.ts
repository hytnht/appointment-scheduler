import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTechnicianDto } from './dtos/create-technician.dto';
import { UpdateTechnicianDto } from './dtos/update-technician.dto';
import { Technician } from './entities/technician.entity';
import { TechnicianService } from './technician.service';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  findAll(): Promise<Technician[]> {
    return this.technicianService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Technician> {
    return this.technicianService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTechnicianDto): Promise<Technician> {
    return this.technicianService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateTechnicianDto,
  ): Promise<Technician> {
    return this.technicianService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<Technician> {
    return this.technicianService.delete(id);
  }

  @Get('/qualifications/:serviceTypeId')
  findQualification(
    @Param('serviceTypeId') serviceTypeId: number,
  ): Promise<Technician[]> {
    return this.technicianService.findActive({ serviceTypeId });
  }

  @Post(':id/qualifications/:serviceTypeId')
  addQualifications(
    @Param('id') id: number,
    @Param('serviceTypeId') serviceTypeId: number,
  ): Promise<void> {
    return this.technicianService.addQualification(id, serviceTypeId);
  }

  @Delete(':id/qualifications/:serviceTypeId')
  removeQualification(
    @Param('id') id: number,
    @Param('serviceTypeId') serviceTypeId: number,
  ): Promise<void> {
    return this.technicianService.removeQualification(id, serviceTypeId);
  }
}
