import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealershipErrorMessages } from './constants/dealership.message';
import { CreateDealershipDto } from './dtos/create-dealership.dto';
import { UpdateDealershipDto } from './dtos/update-dealership.dto';
import { Dealership } from './entities/dealership.entity';

@Injectable()
export class DealershipService {
  constructor(
    @InjectRepository(Dealership)
    private readonly dealershipRepository: Repository<Dealership>,
  ) {}

  async findAll(): Promise<Dealership[]> {
    return this.dealershipRepository.find();
  }

  async findOne(id: number): Promise<Dealership> {
    const dealership = await this.dealershipRepository.findOne({
      where: { id },
    });
    if (!dealership) throw new NotFoundException(DealershipErrorMessages.NOT_FOUND);
    return dealership;
  }

  async exists(id: number): Promise<void> {
    const exists = await this.dealershipRepository.exists({ where: { id } });
    if (!exists) throw new NotFoundException(DealershipErrorMessages.NOT_FOUND);
  }

  async create(dto: CreateDealershipDto): Promise<Dealership> {
    const { openTime, closeTime } = dto;
    if (openTime >= closeTime)
      throw new BadRequestException(DealershipErrorMessages.INVALID_OPEN_CLOSE_TIME);
    return this.dealershipRepository.save(dto);
  }

  async update(id: number, dto: UpdateDealershipDto): Promise<Dealership> {
    const dealership = await this.findOne(id);
    const entity = { ...dealership, ...dto };
    if (entity.openTime >= entity.closeTime)
      throw new BadRequestException(DealershipErrorMessages.INVALID_OPEN_CLOSE_TIME);
    return this.dealershipRepository.save(entity);
  }

  async delete(id: number): Promise<Dealership> {
    const dealership = await this.findOne(id);
    await this.dealershipRepository.delete(id);
    return dealership;
  }
}
