import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DealershipController } from '../dealership.controller';
import { DealershipService } from '../dealership.service';

describe('DealershipController', () => {
  let app: INestApplication<App>;

  const serviceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealershipController],
      providers: [{ provide: DealershipService, useValue: serviceMock }],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('GET /api/dealerships returns empty array', async () => {
    serviceMock.findAll.mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/api/dealerships')
      .expect(200)
      .expect([]);

    expect(serviceMock.findAll).toHaveBeenCalledTimes(1);
  });
});
