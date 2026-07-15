import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dealership } from './entities/dealership.entity';
import { CreateDealershipDto } from './dtos/create-dealership.dto';
import { UpdateDealershipDto } from './dtos/update-dealership.dto';
import { DealershipErrorMessages } from './constants/dealership.message';

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
    if (!dealership)
      throw new NotFoundException(DealershipErrorMessages.NOT_FOUND);
    return dealership;
  }

  async create(dto: CreateDealershipDto): Promise<Dealership> {
    return this.dealershipRepository.save(dto);
  }

  async update(id: number, dto: UpdateDealershipDto): Promise<Dealership> {
    const exists = await this.dealershipRepository.exists({ where: { id } });
    if (!exists) throw new NotFoundException(DealershipErrorMessages.NOT_FOUND);
    return this.dealershipRepository.save({ id, ...dto });
  }

  async delete(id: number): Promise<Dealership> {
    const dealership = await this.findOne(id);
    await this.dealershipRepository.delete(id);
    return dealership;
  }
}
