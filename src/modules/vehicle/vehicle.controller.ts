import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  findAll(): Promise<Vehicle[]> {
    return this.vehicleService.findAll();
  }

  @Get('customer/:customerId')
  findByCustomerId(@Param('customerId') customerId: number): Promise<Vehicle[]> {
    return this.vehicleService.findByCustomerId(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Vehicle> {
    return this.vehicleService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<Vehicle> {
    return this.vehicleService.delete(id);
  }
}
