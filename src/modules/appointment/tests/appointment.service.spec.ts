import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentService } from '../appointment.service';
import { ResourceReservation } from '../entities/resource-reservation.entity';
import { DealershipService } from '../../dealership/dealership.service';
import { ServiceTypeService } from '../../service-type/service-type.service';
import { ServiceBayService } from '../../service-bay/service-bay.service';
import { TechnicianService } from '../../technician/technician.service';
import { VehicleService } from '../../vehicle/vehicle.service';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { AppointmentRepository } from '../appointment.repository';
import { EAppointmentStatus, EResourceType } from '../constants/appointment.constant';

jest.mock('typeorm-transactional', () => ({
  IsolationLevel: { READ_COMMITTED: 'READ_COMMITTED' },
  Propagation: { REQUIRES_NEW: 'REQUIRES_NEW' },
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor =>
      descriptor,
}));

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AppointmentService', () => {
  let moduleRef: TestingModule;
  let service: AppointmentService;
  let reservationRepo: MockRepo<ResourceReservation>;
  let dealershipService: DealershipService;
  let serviceTypeService: ServiceTypeService;
  let serviceBayService: ServiceBayService;
  let technicianService: TechnicianService;
  let vehicleService: VehicleService;

  const appointmentRepoMock = {
    exists: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    lockResource: jest.fn(),
    createAppointment: jest.fn(),
    save: jest.fn(),
  };

  const fixture = {
    id: 99,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    dealershipId: 1,
    customerId: 7,
    vehicleId: 1,
    technicianId: 1,
    serviceBayId: 1,
    startAt: new Date('2026-07-20T09:00:00.000Z'),
    endAt: new Date('2026-07-20T09:30:00.000Z'),
    status: 'CONFIRMED',
  };

  beforeEach(async () => {
    appointmentRepoMock.exists.mockResolvedValue(false);
    appointmentRepoMock.search.mockResolvedValue([[], 0]);
    appointmentRepoMock.lockResource.mockResolvedValue({ id: 1 });
    appointmentRepoMock.createAppointment.mockResolvedValue(fixture);
    appointmentRepoMock.save.mockResolvedValue(fixture);
    appointmentRepoMock.findOne.mockResolvedValue(fixture);
    moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: AppointmentRepository,
          useValue: appointmentRepoMock,
        },
        {
          provide: getRepositoryToken(ResourceReservation),
          useValue: { find: jest.fn(), save: jest.fn(), delete: jest.fn() },
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
          useValue: { findByDealership: jest.fn() },
        },
        {
          provide: TechnicianService,
          useValue: { findBy: jest.fn() },
        },
        {
          provide: VehicleService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(AppointmentService);
    reservationRepo = moduleRef.get(getRepositoryToken(ResourceReservation));
    dealershipService = moduleRef.get(DealershipService);
    serviceTypeService = moduleRef.get(ServiceTypeService);
    serviceBayService = moduleRef.get(ServiceBayService);
    technicianService = moduleRef.get(TechnicianService);
    vehicleService = moduleRef.get(VehicleService);

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
    (vehicleService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      customerId: 7,
    });
    (technicianService.findBy as jest.Mock).mockResolvedValue([
      {
        id: 1,
        active: true,
        dealership: { timezone: 'UTC', openTime: '09:00:00', closeTime: '10:00:00' },
        serviceType: [{ id: 1, durationMinutes: 30 }],
      },
    ]);
    (serviceBayService.findByDealership as jest.Mock).mockResolvedValue([
      { id: 1, active: true, dealershipId: 1 },
    ]);
    reservationRepo.find?.mockResolvedValue([]);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it('returns aligned times when all resources are free', async () => {
    const result = await service.getAvailability(1, 1, '2026-07-20');

    expect(result).toEqual([
      '2026-07-20T09:00:00.000Z',
      '2026-07-20T09:15:00.000Z',
      '2026-07-20T09:30:00.000Z',
    ]);
  });

  it('search returns paginated appointments without filters', async () => {
    appointmentRepoMock.search.mockResolvedValueOnce([[fixture], 1]);

    const result = await service.search({ page: 1, limit: 20 });

    expect(appointmentRepoMock.search).toHaveBeenCalledWith({
      dealershipId: undefined,
      vehicleId: undefined,
      skip: 0,
      take: 20,
    });
    expect(result).toEqual({
      items: [fixture],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('search returns paginated appointments by dealership', async () => {
    appointmentRepoMock.search.mockResolvedValueOnce([[fixture], 1]);

    const result = await service.search({ dealershipId: 1, page: 2, limit: 5 });

    expect(appointmentRepoMock.search).toHaveBeenCalledWith({
      dealershipId: 1,
      vehicleId: undefined,
      skip: 5,
      take: 5,
    });
    expect(result).toEqual({
      items: [fixture],
      pagination: {
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('search forwards both filters when both provided', async () => {
    appointmentRepoMock.search.mockResolvedValueOnce([[], 0]);

    await service.search({ dealershipId: 1, vehicleId: 7, page: 3, limit: 10 });

    expect(appointmentRepoMock.search).toHaveBeenCalledWith({
      dealershipId: 1,
      vehicleId: 7,
      skip: 20,
      take: 10,
    });
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
    (technicianService.findBy as jest.Mock).mockResolvedValue([
      {
        id: 1,
        active: true,
        dealership: { timezone: 'UTC', openTime: '09:07:00', closeTime: '10:00:00' },
        serviceType: [{ id: 1, durationMinutes: 30 }],
      },
    ]);

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual(['2026-07-20T09:15:00.000Z', '2026-07-20T09:30:00.000Z']);
  });

  it('returns UTC slots converted from dealership timezone', async () => {
    (technicianService.findBy as jest.Mock).mockResolvedValue([
      {
        id: 1,
        active: true,
        dealership: { timezone: 'Asia/Tokyo', openTime: '09:00:00', closeTime: '10:00:00' },
        serviceType: [{ id: 1, durationMinutes: 30 }],
      },
    ]);

    const result = await service.getAvailability(1, 1, '2026-07-20');
    expect(result).toEqual([
      '2026-07-20T00:00:00.000Z',
      '2026-07-20T00:15:00.000Z',
      '2026-07-20T00:30:00.000Z',
    ]);
  });

  it('books appointment in transaction when resources free', async () => {
    const dto: CreateAppointmentDto = {
      dealershipId: 1,
      vehicleId: 1,
      serviceTypeId: 1,
      startAt: '2026-07-20T09:00:00.000Z',
    };

    const result = await service.createAppointment(dto);

    const [existsArgRaw] = appointmentRepoMock.exists.mock.calls[0] as [unknown];
    const existsArg = existsArgRaw as { where: { vehicleId: number; startAt: Date } };
    expect(existsArg.where.vehicleId).toBe(1);
    expect(existsArg.where.startAt).toEqual(new Date('2026-07-20T09:00:00.000Z'));
    expect(appointmentRepoMock.lockResource).toHaveBeenCalledTimes(2);
    expect(appointmentRepoMock.lockResource).toHaveBeenNthCalledWith(1, 1, EResourceType.TECH);
    expect(appointmentRepoMock.lockResource).toHaveBeenNthCalledWith(2, 1, EResourceType.BAY);
    expect(appointmentRepoMock.createAppointment).toHaveBeenCalledWith(
      {
        dealershipId: 1,
        customerId: 7,
        vehicleId: 1,
        serviceTypeId: 1,
        startAt: new Date('2026-07-20T09:00:00.000Z'),
        endAt: new Date('2026-07-20T09:30:00.000Z'),
        status: EAppointmentStatus.CONFIRMED,
        technicianId: 1,
        serviceBayId: 1,
      },
      [
        {
          resourceType: 'TECH',
          resourceId: 1,
          slotStart: new Date('2026-07-20T09:00:00.000Z'),
        },
        {
          resourceType: 'BAY',
          resourceId: 1,
          slotStart: new Date('2026-07-20T09:00:00.000Z'),
        },
        {
          resourceType: 'TECH',
          resourceId: 1,
          slotStart: new Date('2026-07-20T09:15:00.000Z'),
        },
        {
          resourceType: 'BAY',
          resourceId: 1,
          slotStart: new Date('2026-07-20T09:15:00.000Z'),
        },
      ],
    );
    expect(result).toEqual(fixture);
  });

  it('throws 409 when the vehicle already has a non-cancelled appointment at the same time', async () => {
    appointmentRepoMock.exists.mockResolvedValueOnce(true);

    await expect(
      service.createAppointment({
        dealershipId: 1,
        vehicleId: 1,
        serviceTypeId: 1,
        startAt: '2026-07-20T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(appointmentRepoMock.createAppointment).not.toHaveBeenCalled();
    expect(appointmentRepoMock.lockResource).not.toHaveBeenCalled();
  });

  it('findOne returns appointment with relations', async () => {
    const relationsFixture = {
      ...fixture,
      dealership: { id: 1 },
      customer: { id: 7 },
      vehicle: { id: 1 },
      technician: { id: 1 },
      serviceBay: { id: 1 },
      serviceType: { id: 1 },
      reservations: [],
    };
    appointmentRepoMock.findOne.mockResolvedValue(relationsFixture);

    const result = await service.findOne(99);

    expect(result).toEqual(relationsFixture);
    expect(appointmentRepoMock.findOne).toHaveBeenCalledWith({
      where: { id: 99 },
      relations: {
        dealership: true,
        vehicle: { customer: true },
        technician: true,
        serviceBay: true,
        serviceType: true,
        reservations: true,
      },
    });
  });

  it('findOne throws NotFoundException when missing', async () => {
    appointmentRepoMock.findOne.mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cancelAppointment sets status cancelled and clears reservations', async () => {
    const cancelledFixture = {
      ...fixture,
      status: EAppointmentStatus.CANCELLED,
      reservations: [],
    };

    appointmentRepoMock.exists.mockResolvedValue(true);
    appointmentRepoMock.save.mockResolvedValueOnce(cancelledFixture);
    reservationRepo.delete?.mockResolvedValue({ affected: 2 });

    const result = await service.cancelAppointment(99);

    expect(reservationRepo.delete).toHaveBeenCalledWith({ appointmentId: 99 });
    expect(appointmentRepoMock.save).toHaveBeenCalledWith({
      id: 99,
      status: EAppointmentStatus.CANCELLED,
    });
    expect(result).toEqual(cancelledFixture);
  });

  it('throws 400 when startAt is off-grid', async () => {
    const dto: CreateAppointmentDto = {
      dealershipId: 1,
      vehicleId: 1,
      serviceTypeId: 1,
      startAt: '2026-07-20T09:07:00.000Z',
    };

    await expect(service.createAppointment(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(appointmentRepoMock.createAppointment).toHaveBeenCalledTimes(0);
  });

  it('throws 404 when no active bays or qualified technicians', async () => {
    (technicianService.findBy as jest.Mock).mockResolvedValue([]);

    const dto: CreateAppointmentDto = {
      dealershipId: 1,
      vehicleId: 1,
      serviceTypeId: 1,
      startAt: '2026-07-20T09:00:00.000Z',
    };

    await expect(service.createAppointment(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(appointmentRepoMock.createAppointment).toHaveBeenCalledTimes(0);
  });
});
