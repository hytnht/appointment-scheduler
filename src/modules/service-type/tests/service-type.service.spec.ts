import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository, mockRepository } from '../../../common/testing/repository.mock';
import { CreateServiceTypeDto } from '../dtos/create-service-type.dto';
import { ServiceType } from '../entities/service-type.entity';
import { ServiceTypeService } from '../service-type.service';
import { ServiceTypeErrorMessages } from '../constants/service-type.message';

describe('ServiceTypeService', () => {
  let service: ServiceTypeService;
  let repo: MockRepository<ServiceType>;

  const dto: CreateServiceTypeDto = {
    code: 'OIL_CHANGE',
    name: 'Oil Change',
    durationMinutes: 30,
  };

  const fixture: ServiceType = {
    ...dto,
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceTypeService,
        {
          provide: getRepositoryToken(ServiceType),
          useFactory: mockRepository<ServiceType>,
        },
      ],
    }).compile();

    service = module.get(ServiceTypeService);
    repo = module.get(getRepositoryToken(ServiceType));
  });

  it('findAll returns empty list', async () => {
    repo.find?.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
    expect(repo.find).toHaveBeenCalledTimes(1);
  });

  it('findOne returns entity', async () => {
    repo.findOne?.mockResolvedValue(fixture);
    expect(await service.findOne(1)).toEqual(fixture);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne?.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('exists resolves when entity exists', async () => {
    repo.exists?.mockResolvedValue(true);
    await expect(service.exists(1)).resolves.toBeUndefined();
    expect(repo.exists).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('exists throws NotFoundException when missing', async () => {
    repo.exists?.mockResolvedValue(false);
    await expect(service.exists(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create saves and returns entity', async () => {
    repo.save?.mockResolvedValue(fixture);
    expect(await service.create(dto)).toEqual(fixture);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('create throws BadRequestException when duration is invalid', async () => {
    const invalidDto = { ...dto, durationMinutes: 7 };
    await expect(service.create(invalidDto)).rejects.toThrowError(
      ServiceTypeErrorMessages.INVALID_DURATION,
    );
  });

  it('update saves and returns entity', async () => {
    repo.exists?.mockResolvedValue(true);
    repo.save?.mockResolvedValue(fixture);
    const patch = { durationMinutes: 45 };
    expect(await service.update(1, patch)).toEqual(fixture);
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
