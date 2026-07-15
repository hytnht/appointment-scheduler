import { Injectable, NotFoundException } from '@nestjs/common';
import { DealershipService } from '../dealership/dealership.service';
import { ServiceTypeService } from '../service-type/service-type.service';
import { TechnicianErrorMessages } from './constants/technician.message';
import { CreateTechnicianDto } from './dtos/create-technician.dto';
import { UpdateTechnicianDto } from './dtos/update-technician.dto';
import { Technician } from './entities/technician.entity';
import { TechnicianRepository } from './technician.repository';

@Injectable()
export class TechnicianService {
  constructor(
    private readonly technicianRepo: TechnicianRepository,
    private readonly dealershipService: DealershipService,
    private readonly serviceTypeService: ServiceTypeService,
  ) {}

  findAll(): Promise<Technician[]> {
    return this.technicianRepo.find({
      relations: { dealership: true, serviceType: true },
    });
  }

  async findOne(id: number): Promise<Technician> {
    const tech = await this.technicianRepo.findOne({
      where: { id },
      relations: { dealership: true, serviceType: true },
    });
    if (!tech) throw new NotFoundException(TechnicianErrorMessages.NOT_FOUND);
    return tech;
  }

  findByServiceId(serviceTypeId: number): Promise<Technician[]> {
    return this.technicianRepo.find({
      where: { serviceType: { id: serviceTypeId } },
      relations: { dealership: true, serviceType: true },
    });
  }

  async exists(id: number): Promise<void> {
    const exists = await this.technicianRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(TechnicianErrorMessages.NOT_FOUND);
  }

  async create(dto: CreateTechnicianDto): Promise<Technician> {
    const { dealershipId, serviceTypeIds } = dto;

    await this.dealershipService.exists(dealershipId);
    if (serviceTypeIds?.length) {
      await this.serviceTypeService.existMany(serviceTypeIds);
      Object.assign(dto, { serviceType: serviceTypeIds.map((id) => ({ id })) });
    }
    return this.technicianRepo.save(dto);
  }

  async update(id: number, dto: UpdateTechnicianDto): Promise<Technician> {
    await this.exists(id);
    const { dealershipId, serviceTypeIds } = dto;

    if (dealershipId) await this.dealershipService.exists(dealershipId);
    if (serviceTypeIds?.length) {
      await this.serviceTypeService.existMany(serviceTypeIds);
      Object.assign(dto, { serviceType: serviceTypeIds.map((id) => ({ id })) });
    }

    return this.technicianRepo.save({ id, ...dto });
  }

  async delete(id: number): Promise<Technician> {
    const tech = await this.findOne(id);
    await this.technicianRepo.delete(id);
    return tech;
  }

  async addQualification(
    technicianId: number,
    serviceTypeId: number,
  ): Promise<void> {
    await this.exists(technicianId);
    await this.serviceTypeService.exists(serviceTypeId);
    await this.technicianRepo.addServiceType(technicianId, serviceTypeId);
  }

  async removeQualification(
    technicianId: number,
    serviceTypeId: number,
  ): Promise<void> {
    await this.technicianRepo.removeServiceType(technicianId, serviceTypeId);
  }
}
