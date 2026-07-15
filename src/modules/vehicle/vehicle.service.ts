import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { VehicleErrorMessages } from './constants/vehicle.message';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  findAll(): Promise<Vehicle[]> {
    return this.vehicleRepo.find({ relations: { customer: true } });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: { customer: true },
    });
    if (!vehicle) throw new NotFoundException(VehicleErrorMessages.NOT_FOUND);
    return vehicle;
  }

  findByCustomerId(customerId: number): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      where: { customerId },
      relations: { customer: true },
    });
  }

  create(dto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleRepo.save(dto);
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    const exists = await this.vehicleRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(VehicleErrorMessages.NOT_FOUND);
    return this.vehicleRepo.save({ id, ...dto });
  }

  async delete(id: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepo.delete(id);
    return vehicle;
  }
}
