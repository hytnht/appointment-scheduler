import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository, mockRepository } from '../../../common/testing/repository.mock';
import { VehicleService } from '../vehicle.service';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { Vehicle } from '../entities/vehicle.entity';
import { CustomerService } from '../../customer/customer.service';

describe('VehicleService', () => {
  let moduleRef: TestingModule;
  let service: VehicleService;
  let repo: MockRepository<Vehicle>;
  let customerService: CustomerService;

  const dto: CreateVehicleDto = {
    customerId: 1,
    vin: '1HGCM82633A123456',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
  };

  const fixture: Vehicle = {
    ...dto,
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    customer: undefined,
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useFactory: mockRepository<Vehicle>,
        },
        {
          provide: CustomerService,
          useValue: { exists: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(VehicleService);
    repo = moduleRef.get(getRepositoryToken(Vehicle));
    customerService = moduleRef.get(CustomerService);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it('findAll returns empty list', async () => {
    repo.find?.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
    expect(repo.find).toHaveBeenCalledWith({ relations: { customer: true } });
  });

  it('findOne returns entity with relations', async () => {
    repo.findOne?.mockResolvedValue(fixture);
    expect(await service.findOne(1)).toEqual(fixture);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { customer: true },
    });
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne?.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findByCustomerId returns list of vehicles', async () => {
    const vehicles = [fixture];
    repo.find?.mockResolvedValue(vehicles);
    expect(await service.findByCustomerId(1)).toEqual(vehicles);
    expect(repo.find).toHaveBeenCalledWith({
      where: { customerId: 1 },
      relations: { customer: true },
    });
  });

  it('findByCustomerId returns empty list when no vehicles', async () => {
    repo.find?.mockResolvedValue([]);
    expect(await service.findByCustomerId(99)).toEqual([]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { customerId: 99 },
      relations: { customer: true },
    });
  });

  it('create saves and returns entity', async () => {
    (customerService.exists as jest.Mock).mockResolvedValue(undefined);
    repo.save?.mockResolvedValue(fixture);
    expect(await service.create(dto)).toEqual(fixture);
    expect(customerService.exists).toHaveBeenCalledWith(dto.customerId);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('update saves and returns entity', async () => {
    repo.exists?.mockResolvedValue(true);
    (customerService.exists as jest.Mock).mockResolvedValue(undefined);
    repo.save?.mockResolvedValue(fixture);
    const patch = { model: 'Accord', customerId: 2 };
    expect(await service.update(1, patch)).toEqual(fixture);
    expect(customerService.exists).toHaveBeenCalledWith(2);
    expect(repo.save).toHaveBeenCalledWith({ id: 1, ...patch });
  });

  it('update throws NotFoundException when missing', async () => {
    repo.exists?.mockResolvedValue(false);
    await expect(service.update(99, {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delete removes entity', async () => {
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
