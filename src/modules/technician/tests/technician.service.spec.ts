import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianService } from '../technician.service';
import { TechnicianRepository } from '../technician.repository';
import { DealershipService } from '../../dealership/dealership.service';
import { ServiceTypeService } from '../../service-type/service-type.service';
import { CreateTechnicianDto } from '../dtos/create-technician.dto';
import { Technician } from '../entities/technician.entity';

type MockTechnicianRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
  exists: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  addServiceType: jest.Mock;
  removeServiceType: jest.Mock;
};

describe('TechnicianService', () => {
  let moduleRef: TestingModule;
  let service: TechnicianService;
  let techRepo: MockTechnicianRepository;
  let dealershipService: DealershipService;
  let serviceTypeService: ServiceTypeService;

  const dto: CreateTechnicianDto = {
    dealershipId: 1,
    name: 'John Doe',
    active: true,
  };

  const fixture: Technician = {
    ...dto,
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    dealership: undefined,
    serviceType: [],
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        TechnicianService,
        {
          provide: TechnicianRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            exists: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            addServiceType: jest.fn(),
            removeServiceType: jest.fn(),
          },
        },
        {
          provide: DealershipService,
          useValue: { exists: jest.fn() },
        },
        {
          provide: ServiceTypeService,
          useValue: { exists: jest.fn(), existMany: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(TechnicianService);
    techRepo = moduleRef.get(TechnicianRepository);
    dealershipService = moduleRef.get(DealershipService);
    serviceTypeService = moduleRef.get(ServiceTypeService);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it('findAll returns empty list', async () => {
    techRepo.find?.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
    expect(techRepo.find).toHaveBeenCalledWith({
      relations: { dealership: true, serviceType: true },
    });
  });

  it('findOne returns entity with relations', async () => {
    techRepo.findOne?.mockResolvedValue(fixture);
    expect(await service.findOne(1)).toEqual(fixture);
    expect(techRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { dealership: true, serviceType: true },
    });
  });

  it('findOne throws NotFoundException when missing', async () => {
    techRepo.findOne?.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create validates dealership and saves', async () => {
    (dealershipService.exists as jest.Mock).mockResolvedValue(undefined);
    techRepo.save?.mockResolvedValue(fixture);
    expect(await service.create(dto)).toEqual(fixture);
    expect(dealershipService.exists).toHaveBeenCalledWith(1);
    expect(techRepo.save).toHaveBeenCalledWith(dto);
  });

  it('create validates service types when provided', async () => {
    (dealershipService.exists as jest.Mock).mockResolvedValue(undefined);
    (serviceTypeService.existMany as jest.Mock).mockResolvedValue(undefined);
    techRepo.save?.mockResolvedValue(fixture);

    const withServices: CreateTechnicianDto = {
      ...dto,
      serviceTypeIds: [1, 2],
    };

    await service.create(withServices);

    expect(serviceTypeService.existMany).toHaveBeenCalledWith([1, 2]);
    expect(techRepo.save).toHaveBeenCalledWith({
      ...withServices,
      serviceType: [{ id: 1 }, { id: 2 }],
    });
  });

  it('create throws NotFoundException when dealership missing', async () => {
    (dealershipService.exists as jest.Mock).mockRejectedValue(new NotFoundException());
    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update validates dealership if provided', async () => {
    techRepo.exists?.mockResolvedValue(true);
    (dealershipService.exists as jest.Mock).mockResolvedValue(undefined);
    techRepo.save?.mockResolvedValue(fixture);
    const patch = { dealershipId: 2 };
    expect(await service.update(1, patch)).toEqual(fixture);
    expect(dealershipService.exists).toHaveBeenCalledWith(2);
  });

  it('update validates service types when provided', async () => {
    techRepo.exists?.mockResolvedValue(true);
    (serviceTypeService.existMany as jest.Mock).mockResolvedValue(undefined);
    techRepo.save?.mockResolvedValue(fixture);

    const patch = { serviceTypeIds: [3, 4] };
    await service.update(1, patch);

    expect(serviceTypeService.existMany).toHaveBeenCalledWith([3, 4]);
    expect(techRepo.save).toHaveBeenCalledWith({
      id: 1,
      ...patch,
      serviceType: [{ id: 3 }, { id: 4 }],
    });
  });

  it('findBy returns active technicians list', async () => {
    techRepo.find?.mockResolvedValue([fixture]);
    expect(await service.findBy({ serviceTypeId: 9 }, true)).toEqual([fixture]);
    expect(techRepo.find).toHaveBeenCalledWith({
      where: { dealershipId: undefined, serviceType: { id: 9 }, active: true },
      relations: { dealership: true, serviceType: true },
    });
  });

  it('exists resolves when entity exists', async () => {
    techRepo.exists?.mockResolvedValue(true);
    await expect(service.exists(1)).resolves.toBeUndefined();
    expect(techRepo.exists).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('exists throws NotFoundException when missing', async () => {
    techRepo.exists?.mockResolvedValue(false);
    await expect(service.exists(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update throws NotFoundException when missing', async () => {
    techRepo.exists?.mockResolvedValue(false);
    await expect(service.update(99, {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delete removes and returns entity', async () => {
    techRepo.findOne?.mockResolvedValue(fixture);
    techRepo.delete?.mockResolvedValue({ affected: 1 });
    expect(await service.delete(1)).toEqual(fixture);
    expect(techRepo.delete).toHaveBeenCalledWith(1);
  });

  it('delete throws NotFoundException when missing', async () => {
    techRepo.findOne?.mockResolvedValue(null);
    await expect(service.delete(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('addQualification validates tech and service type', async () => {
    techRepo.exists?.mockResolvedValue(true);
    (serviceTypeService.exists as jest.Mock).mockResolvedValue(undefined);
    techRepo.addServiceType?.mockResolvedValue(undefined);

    await service.addQualification(1, 1);

    expect(techRepo.exists).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(serviceTypeService.exists).toHaveBeenCalledWith(1);
    expect(techRepo.addServiceType).toHaveBeenCalledWith(1, 1);
  });

  it('removeQualification deletes qualification', async () => {
    techRepo.removeServiceType?.mockResolvedValue(undefined);
    await service.removeQualification(1, 1);
    expect(techRepo.removeServiceType).toHaveBeenCalledWith(1, 1);
  });
});
