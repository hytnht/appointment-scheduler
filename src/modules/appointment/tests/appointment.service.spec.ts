import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentService } from '../appointment.service';
import { ResourceReservation } from '../entities/resource-reservation.entity';
import { DealershipService } from '../../dealership/dealership.service';
import { ServiceTypeService } from '../../service-type/service-type.service';
import { ServiceBayService } from '../../service-bay/service-bay.service';
import { TechnicianService } from '../../technician/technician.service';

type MockReservationRepo = Partial<Record<keyof Repository<ResourceReservation>, jest.Mock>>;

describe('AppointmentService', () => {
  let service: AppointmentService;
  let reservationRepo: MockReservationRepo;
  let dealershipService: DealershipService;
  let serviceTypeService: ServiceTypeService;
  let serviceBayService: ServiceBayService;
  let technicianService: TechnicianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(ResourceReservation),
          useValue: { find: jest.fn() },
        },
        {
          provide: DealershipService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ServiceTypeService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ServiceBayService,
          useValue: { findByDealershipId: jest.fn() },
        },
        {
          provide: TechnicianService,
          useValue: { findActive: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AppointmentService);
    reservationRepo = module.get(getRepositoryToken(ResourceReservation));
    dealershipService = module.get(DealershipService);
    serviceTypeService = module.get(ServiceTypeService);
    serviceBayService = module.get(ServiceBayService);
    technicianService = module.get(TechnicianService);

    (dealershipService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      openTime: '09:00:00',
      closeTime: '10:00:00',
      timezone: 'UTC',
    });
    (serviceTypeService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      durationMinutes: 30,
    });
    (technicianService.findActive as jest.Mock).mockResolvedValue([
      { id: 1, active: true, dealershipId: 1 },
    ]);
    (serviceBayService.findByDealershipId as jest.Mock).mockResolvedValue([
      { id: 1, active: true, dealershipId: 1 },
    ]);
    reservationRepo.find?.mockResolvedValue([]);
  });

  it('returns aligned times when all resources are free', async () => {
    const result = await service.getAvailability(1, 1, '2026-07-20');

    expect(result).toEqual([
      '2026-07-20T09:00:00.000Z',
      '2026-07-20T09:15:00.000Z',
      '2026-07-20T09:30:00.000Z',
    ]);
  });

  it('returns empty when fully booked', async () => {
    reservationRepo.find?.mockResolvedValue([
      {
        resourceType: 'TECH',
        resourceId: 1,
        slotStart: new Date('2026-07-20T09:00:00.000Z'),
      },
      {
        resourceType: 'TECH',
        resourceId: 1,
        slotStart: new Date('2026-07-20T09:15:00.000Z'),
      },
      {
        resourceType: 'TECH',
        resourceId: 1,
        slotStart: new Date('2026-07-20T09:30:00.000Z'),
      },
      {
        resourceType: 'TECH',
        resourceId: 1,
        slotStart: new Date('2026-07-20T09:45:00.000Z'),
      },
    ]);

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual([]);
  });

  it('excludes window when technician has partial overlap', async () => {
    reservationRepo.find?.mockResolvedValue([
      {
        resourceType: 'TECH',
        resourceId: 1,
        slotStart: new Date('2026-07-20T09:15:00.000Z'),
      },
    ]);

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual(['2026-07-20T09:30:00.000Z']);
  });

  it('excludes window when bay has partial overlap', async () => {
    reservationRepo.find?.mockResolvedValue([
      {
        resourceType: 'BAY',
        resourceId: 1,
        slotStart: new Date('2026-07-20T09:15:00.000Z'),
      },
    ]);

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual(['2026-07-20T09:30:00.000Z']);
  });

  it('keeps aligned starts when dealership open time is not divisible by 15', async () => {
    (dealershipService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      openTime: '09:07:00',
      closeTime: '10:00:00',
      timezone: 'UTC',
    });

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual(['2026-07-20T09:15:00.000Z', '2026-07-20T09:30:00.000Z']);
  });

  it('returns UTC slots converted from dealership timezone', async () => {
    (dealershipService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      openTime: '09:00:00',
      closeTime: '10:00:00',
      timezone: 'Asia/Tokyo',
    });

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual([
      '2026-07-20T00:00:00.000Z',
      '2026-07-20T00:15:00.000Z',
      '2026-07-20T00:30:00.000Z',
    ]);
  });
});
