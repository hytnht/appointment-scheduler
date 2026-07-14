import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  mockRepository,
} from '../../common/testing/repository.mock';
import { DealershipService } from '../dealership.service';
import { CreateDealershipDto } from '../dtos/create-dealership.dto';
import { Dealership } from '../entities/dealership.entity';

describe('DealershipService', () => {
  let service: DealershipService;
  let repository: MockRepository<Dealership>;

  const dealershipDto: CreateDealershipDto = {
    name: 'Main Branch',
    address: '123 Service Ave',
    city: 'Austin',
    country: 'US',
    timezone: 'America/Chicago',
    openTime: '08:00',
    closeTime: '18:00',
  };

  const dealershipFixture: Dealership = {
    ...dealershipDto,
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealershipService,
        {
          provide: getRepositoryToken(Dealership),
          useFactory: mockRepository<Dealership>,
        },
      ],
    }).compile();

    service = module.get(DealershipService);
    repository = module.get(getRepositoryToken(Dealership));
  });

  it('findAll returns empty list', async () => {
    repository.find?.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('findOne returns entity', async () => {
    repository.findOne?.mockResolvedValue(dealershipFixture);

    const result = await service.findOne(1);

    expect(result).toEqual(dealershipFixture);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('findOne throws when not found', async () => {
    repository.findOne?.mockResolvedValue(null);

    await expect(service.findOne(2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create persists entity', async () => {
    repository.save?.mockResolvedValue(dealershipFixture);
    const result = await service.create(dealershipDto);
    expect(repository.save).toHaveBeenCalledWith(dealershipDto);
    expect(result).toEqual(dealershipFixture);
  });

  it('update merges and persists entity', async () => {
    repository.exists?.mockResolvedValue(true);
    repository.save?.mockResolvedValue({
      ...dealershipDto,
      city: 'Dallas',
    });

    const result = await service.update(1, { city: 'Dallas' });

    expect(repository.exists).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(repository.save).toHaveBeenCalledWith({ id: 1, city: 'Dallas' });
    expect(result.city).toBe('Dallas');
  });

  it('update throws when entity does not exist', async () => {
    repository.exists?.mockResolvedValue(false);

    await expect(service.update(1, { city: 'Dallas' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
