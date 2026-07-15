import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ServiceBayService } from './service-bay.service';
import { CreateServiceBayDto } from './dtos/create-service-bay.dto';
import { UpdateServiceBayDto } from './dtos/update-service-bay.dto';
import { ServiceBay } from './entities/service-bay.entity';

@Controller('service-bays')
export class ServiceBayController {
  constructor(private readonly serviceBayService: ServiceBayService) {}

  @Get()
  findAll(): Promise<ServiceBay[]> {
    return this.serviceBayService.findAll();
  }

  @Get('dealership/:dealershipId')
  findByDealership(
    @Param('dealershipId') dealershipId: number,
  ): Promise<ServiceBay[]> {
    return this.serviceBayService.findByDealershipId(dealershipId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ServiceBay> {
    return this.serviceBayService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceBayDto): Promise<ServiceBay> {
    return this.serviceBayService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateServiceBayDto,
  ): Promise<ServiceBay> {
    return this.serviceBayService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<ServiceBay> {
    return this.serviceBayService.delete(id);
  }
}
