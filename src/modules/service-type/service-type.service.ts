import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceType } from './entities/service-type.entity';
import { CreateServiceTypeDto } from './dtos/create-service-type.dto';
import { UpdateServiceTypeDto } from './dtos/update-service-type.dto';
import { ServiceTypeErrorMessages } from './constants/service-type.message';
import { validateDuration } from './service-type.helper';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepo: Repository<ServiceType>,
  ) {}

  findAll(): Promise<ServiceType[]> {
    return this.serviceTypeRepo.find();
  }

  async findOne(id: number): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepo.findOne({
      where: { id },
    });
    if (!serviceType) throw new NotFoundException(ServiceTypeErrorMessages.NOT_FOUND);
    return serviceType;
  }

  async findByIds(ids: number[]): Promise<ServiceType[]> {
    const serviceTypes = await this.serviceTypeRepo.find({
      where: { id: In(ids) },
    });
    return serviceTypes;
  }

  async exists(id: number): Promise<void> {
    const exists = await this.serviceTypeRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(ServiceTypeErrorMessages.NOT_FOUND);
  }

  async existMany(ids: number[]): Promise<void> {
    const existed = await this.serviceTypeRepo.count({
      where: { id: In(ids) },
    });
    if (existed !== ids.length) throw new NotFoundException(ServiceTypeErrorMessages.NOT_FOUND);
  }
  create(dto: CreateServiceTypeDto): Promise<ServiceType> {
    validateDuration(dto.durationMinutes);
    return this.serviceTypeRepo.save(dto);
  }

  async update(id: number, dto: UpdateServiceTypeDto): Promise<ServiceType> {
    const exists = await this.serviceTypeRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(ServiceTypeErrorMessages.NOT_FOUND);

    if (dto.durationMinutes) validateDuration(dto.durationMinutes);
    return this.serviceTypeRepo.save({ id, ...dto });
  }

  async delete(id: number): Promise<ServiceType> {
    const serviceType = await this.findOne(id);
    await this.serviceTypeRepo.delete(id);
    return serviceType;
  }
}
