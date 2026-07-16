import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';
import { AppModule } from '../src/app.module';
import { RuntimeConfig, SwaggerConfig } from '../src/configs/config.interface';
import { EAppointmentStatus } from '../src/modules/appointment/constants/appointment.constant';
import { Appointment } from '../src/modules/appointment/entities/appointment.entity';
import { ResourceReservation } from '../src/modules/appointment/entities/resource-reservation.entity';
import { Customer } from '../src/modules/customer/entities/customer.entity';
import { Dealership } from '../src/modules/dealership/entities/dealership.entity';
import { ServiceBay } from '../src/modules/service-bay/entities/service-bay.entity';
import { ServiceType } from '../src/modules/service-type/entities/service-type.entity';
import { Technician } from '../src/modules/technician/entities/technician.entity';
import { Vehicle } from '../src/modules/vehicle/entities/vehicle.entity';

type SeededFixture = {
  dealership: Dealership;
  customer: Customer;
  vehicle: Vehicle;
  serviceType: ServiceType;
  serviceBay: ServiceBay;
  technician: Technician;
};

describe('Appointment booking (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let moduleRef: TestingModule;
  let appointmentRepo: Repository<Appointment>;
  let reservationRepo: Repository<ResourceReservation>;
  let dealershipRepo: Repository<Dealership>;
  let customerRepo: Repository<Customer>;
  let vehicleRepo: Repository<Vehicle>;
  let serviceTypeRepo: Repository<ServiceType>;
  let serviceBayRepo: Repository<ServiceBay>;
  let technicianRepo: Repository<Technician>;

  beforeAll(async () => {
    initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        validationError: {
          target: false,
          value: false,
        },
        transformOptions: { enableImplicitConversion: true },
        stopAtFirstError: true,
      }),
    );

    const configService = app.get(ConfigService<RuntimeConfig>);
    const swaggerConfig = configService.getOrThrow<SwaggerConfig>('swagger');
    expect(swaggerConfig.enabled).toBeDefined();

    await app.init();

    dataSource = app.get(DataSource);
    appointmentRepo = dataSource.getRepository(Appointment);
    reservationRepo = dataSource.getRepository(ResourceReservation);
    dealershipRepo = dataSource.getRepository(Dealership);
    customerRepo = dataSource.getRepository(Customer);
    vehicleRepo = dataSource.getRepository(Vehicle);
    serviceTypeRepo = dataSource.getRepository(ServiceType);
    serviceBayRepo = dataSource.getRepository(ServiceBay);
    technicianRepo = dataSource.getRepository(Technician);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await moduleRef.close();
  });

  it('POST /api/appointments books an appointment and reserves both resources', async () => {
    const fx = await seedBookingFixture();

    const response = await request(app.getHttpServer())
      .post('/api/appointments')
      .send({
        dealershipId: fx.dealership.id,
        serviceBayId: fx.serviceBay.id,
        vehicleId: fx.vehicle.id,
        serviceTypeId: fx.serviceType.id,
        startAt: '2026-07-20T09:00:00.000Z',
      })
      .expect(201);

    expect(response.body.isSuccess).toBe(true);
    expect(response.body.data).toMatchObject({
      dealershipId: fx.dealership.id,
      customerId: fx.customer.id,
      vehicleId: fx.vehicle.id,
      serviceBayId: fx.serviceBay.id,
      serviceTypeId: fx.serviceType.id,
      technicianId: fx.technician.id,
      startAt: '2026-07-20T09:00:00.000Z',
      endAt: '2026-07-20T09:30:00.000Z',
      status: EAppointmentStatus.CONFIRMED,
    });

    const appointmentId = response.body.data.id as number;
    const saved = await appointmentRepo.findOne({ where: { id: appointmentId } });
    const reservations = await reservationRepo.find({
      where: { appointmentId },
      order: { slotStart: 'ASC', resourceType: 'ASC' },
    });

    expect(saved).not.toBeNull();
    expect(reservations).toHaveLength(4);
    expect(reservations.map((reservation) => reservation.slotStart.toISOString())).toEqual([
      '2026-07-20T09:00:00.000Z',
      '2026-07-20T09:00:00.000Z',
      '2026-07-20T09:15:00.000Z',
      '2026-07-20T09:15:00.000Z',
    ]);
    expect(await reservationRepo.count()).toBe(4);
  });

  async function seedBookingFixture(): Promise<SeededFixture> {
    const dealership = await dealershipRepo.save({
      name: 'Downtown Service',
      address: '123 Main St',
      city: 'Seoul',
      country: 'KR',
      timezone: 'UTC',
      openTime: '08:00:00',
      closeTime: '17:00:00',
    });

    const customer = await customerRepo.save({
      name: 'Jane Driver',
      email: 'jane.driver@example.com',
      phone: '010-1234-5678',
    });

    const vehicle = await vehicleRepo.save({
      vin: '1HGCM82633A123456',
      make: 'Honda',
      model: 'Accord',
      year: 2024,
      customerId: customer.id,
    });

    const serviceType = await serviceTypeRepo.save({
      code: 'OIL-30',
      name: 'Oil Change',
      durationMinutes: 30,
    });

    const serviceBay = await serviceBayRepo.save({
      name: 'Bay 1',
      active: true,
      dealershipId: dealership.id,
    });

    const technician = await technicianRepo.save({
      name: 'Tech 1',
      active: true,
      dealershipId: dealership.id,
    });

    await dataSource
      .createQueryBuilder()
      .relation(Technician, 'serviceType')
      .of(technician.id)
      .add(serviceType.id);

    return {
      dealership,
      customer,
      vehicle,
      serviceType,
      serviceBay,
      technician,
    };
  }
});
