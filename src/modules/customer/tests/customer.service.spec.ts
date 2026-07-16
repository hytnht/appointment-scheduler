import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository, mockRepository } from '../../../common/testing/repository.mock';
import { CustomerService } from '../customer.service';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Customer } from '../entities/customer.entity';

describe('CustomerService', () => {
  let moduleRef: TestingModule;
  let service: CustomerService;
  let repo: MockRepository<Customer>;

  const dto: CreateCustomerDto = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1-555-867-5309',
  };

  const fixture: Customer = {
    ...dto,
    phone: dto.phone ?? null,
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useFactory: mockRepository<Customer>,
        },
      ],
    }).compile();

    service = moduleRef.get(CustomerService);
    repo = moduleRef.get(getRepositoryToken(Customer));
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
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

  it('create saves and returns entity', async () => {
    repo.save?.mockResolvedValue(fixture);
    expect(await service.create(dto)).toEqual(fixture);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('update saves and returns entity', async () => {
    repo.exists?.mockResolvedValue(true);
    repo.save?.mockResolvedValue(fixture);
    const patch = { name: 'Jane Smith' };
    expect(await service.update(1, patch)).toEqual(fixture);
    expect(repo.save).toHaveBeenCalledWith({ id: 1, ...patch });
  });

  it('update throws NotFoundException when missing', async () => {
    repo.exists?.mockResolvedValue(false);
    await expect(service.update(99, {})).rejects.toBeInstanceOf(NotFoundException);
  });
});
