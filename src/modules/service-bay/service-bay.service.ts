import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBay } from './entities/service-bay.entity';
import { CreateServiceBayDto } from './dtos/create-service-bay.dto';
import { UpdateServiceBayDto } from './dtos/update-service-bay.dto';
import { ServiceBayErrorMessages } from './constants/service-bay.message';
import { DealershipService } from '../dealership/dealership.service';

@Injectable()
export class ServiceBayService {
  constructor(
    @InjectRepository(ServiceBay)
    private readonly bayRepo: Repository<ServiceBay>,
    private readonly dealershipService: DealershipService,
  ) {}

  findAll(): Promise<ServiceBay[]> {
    return this.bayRepo.find({ relations: { dealership: true } });
  }

  findByDealership(dealershipId: number, active?: boolean): Promise<ServiceBay[]> {
    return this.bayRepo.find({
      where: { dealershipId, ...(active !== undefined ? { active } : {}) },
      relations: { dealership: true },
    });
  }

  async findOne(id: number): Promise<ServiceBay> {
    const bay = await this.bayRepo.findOne({
      where: { id },
      relations: { dealership: true },
    });
    if (!bay) throw new NotFoundException(ServiceBayErrorMessages.NOT_FOUND);
    return bay;
  }

  async create(dto: CreateServiceBayDto): Promise<ServiceBay> {
    await this.dealershipService.exists(dto.dealershipId);
    return this.bayRepo.save(dto);
  }

  async update(id: number, dto: UpdateServiceBayDto): Promise<ServiceBay> {
    const exists = await this.bayRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(ServiceBayErrorMessages.NOT_FOUND);

    if (dto.dealershipId) await this.dealershipService.exists(dto.dealershipId);
    return this.bayRepo.save({ id, ...dto });
  }

  async delete(id: number): Promise<ServiceBay> {
    const bay = await this.findOne(id);
    await this.bayRepo.delete(id);
    return bay;
  }
}
