import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DealershipService } from './dealership.service';
import { CreateDealershipDto } from './dtos/create-dealership.dto';
import { UpdateDealershipDto } from './dtos/update-dealership.dto';
import { Dealership } from './entities/dealership.entity';

@Controller('dealerships')
export class DealershipController {
  constructor(private readonly dealershipService: DealershipService) {}

  @Get()
  findAll(): Promise<Dealership[]> {
    return this.dealershipService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Dealership> {
    return this.dealershipService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDealershipDto): Promise<Dealership> {
    return this.dealershipService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDealershipDto): Promise<Dealership> {
    return this.dealershipService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<Dealership> {
    return this.dealershipService.delete(id);
  }
}
