import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository, mockRepository } from '../../../common/testing/repository.mock';
import { ServiceBayService } from '../service-bay.service';
import { CreateServiceBayDto } from '../dtos/create-service-bay.dto';
import { ServiceBay } from '../entities/service-bay.entity';
import { DealershipService } from '../../dealership/dealership.service';

describe('ServiceBayService', () => {
  let moduleRef: TestingModule;
  let service: ServiceBayService;
  let repo: MockRepository<ServiceBay>;
  let dealershipService: DealershipService;

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
    moduleRef = await Test.createTestingModule({
      providers: [
        ServiceBayService,
        {
          provide: getRepositoryToken(ServiceBay),
          useFactory: mockRepository<ServiceBay>,
        },
        {
          provide: DealershipService,
          useValue: { exists: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(ServiceBayService);
    repo = moduleRef.get(getRepositoryToken(ServiceBay));
    dealershipService = moduleRef.get(DealershipService);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it('findByDealership returns empty list', async () => {
    repo.find?.mockResolvedValue([]);
    expect(await service.findByDealership(1)).toEqual([]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { dealershipId: 1 },
      relations: { dealership: true },
    });
  });

  it('findAll returns empty list', async () => {
    repo.find?.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
    expect(repo.find).toHaveBeenCalledWith({ relations: { dealership: true } });
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
    (dealershipService.exists as jest.Mock).mockResolvedValue(undefined);
    repo.save?.mockResolvedValue(fixture);
    expect(await service.create(dto)).toEqual(fixture);
    expect(dealershipService.exists).toHaveBeenCalledWith(dto.dealershipId);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('update saves and returns entity', async () => {
    repo.exists?.mockResolvedValue(true);
    (dealershipService.exists as jest.Mock).mockResolvedValue(undefined);
    repo.save?.mockResolvedValue(fixture);
    const patch = { name: 'Bay 2', dealershipId: 2 };
    expect(await service.update(1, patch)).toEqual(fixture);
    expect(dealershipService.exists).toHaveBeenCalledWith(2);
    expect(repo.save).toHaveBeenCalledWith({ id: 1, ...patch });
  });

  it('update throws NotFoundException when missing', async () => {
    repo.exists?.mockResolvedValue(false);
    await expect(service.update(99, {})).rejects.toBeInstanceOf(NotFoundException);
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
