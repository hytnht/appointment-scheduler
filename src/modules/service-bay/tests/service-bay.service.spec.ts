import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  mockRepository,
} from '../../../common/testing/repository.mock';
import { ServiceBayService } from '../service-bay.service';
import { CreateServiceBayDto } from '../dtos/create-service-bay.dto';
import { ServiceBay } from '../entities/service-bay.entity';

describe('ServiceBayService', () => {
  let service: ServiceBayService;
  let repo: MockRepository<ServiceBay>;

  const dto: CreateServiceBayDto = {
    dealershipId: 1,
    name: 'Bay 1',
    active: true,
  };

  const fixture: ServiceBay = {
    ...dto,
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    dealership: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceBayService,
        {
          provide: getRepositoryToken(ServiceBay),
          useFactory: mockRepository<ServiceBay>,
        },
      ],
    }).compile();

    service = module.get(ServiceBayService);
    repo = module.get(getRepositoryToken(ServiceBay));
  });

  it('findByDealership returns empty list', async () => {
    repo.find?.mockResolvedValue([]);
    expect(await service.findByDealership(1)).toEqual([]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { dealership: { id: 1 } },
      relations: { dealership: true },
    });
  });

  it('findOne returns entity with relations', async () => {
    repo.findOne?.mockResolvedValue(fixture);
    expect(await service.findOne(1)).toEqual(fixture);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { dealership: true },
    });
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne?.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create saves and returns entity', async () => {
    repo.save?.mockResolvedValue(fixture);
    expect(await service.create(dto)).toEqual(fixture);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('update saves and returns entity', async () => {
    repo.exists?.mockResolvedValue(true);
    repo.save?.mockResolvedValue(fixture);
    const patch = { name: 'Bay 2' };
    expect(await service.update(1, patch)).toEqual(fixture);
    expect(repo.save).toHaveBeenCalledWith({ id: 1, ...patch });
  });

  it('update throws NotFoundException when missing', async () => {
    repo.exists?.mockResolvedValue(false);
    await expect(service.update(99, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('delete removes and returns entity', async () => {
    repo.findOne?.mockResolvedValue(fixture);
    repo.delete?.mockResolvedValue({ affected: 1 });
    expect(await service.delete(1)).toEqual(fixture);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('delete throws NotFoundException when missing', async () => {
    repo.findOne?.mockResolvedValue(null);
    await expect(service.delete(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
