import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { CreateServiceTypeDto } from './dtos/create-service-type.dto';
import { UpdateServiceTypeDto } from './dtos/update-service-type.dto';
import { ServiceType } from './entities/service-type.entity';

@Controller('service-types')
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Get()
  findAll(): Promise<ServiceType[]> {
    return this.serviceTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ServiceType> {
    return this.serviceTypeService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceTypeDto): Promise<ServiceType> {
    return this.serviceTypeService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateServiceTypeDto,
  ): Promise<ServiceType> {
    return this.serviceTypeService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<ServiceType> {
    return this.serviceTypeService.delete(id);
  }
}
