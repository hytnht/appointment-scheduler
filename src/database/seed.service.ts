import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '@src/modules/customer/entities/customer.entity';
import { Dealership } from '@src/modules/dealership/entities/dealership.entity';
import { ServiceBay } from '@src/modules/service-bay/entities/service-bay.entity';
import { ServiceType } from '@src/modules/service-type/entities/service-type.entity';
import { Technician } from '@src/modules/technician/entities/technician.entity';
import { Vehicle } from '@src/modules/vehicle/entities/vehicle.entity';
import { DataSource, In, Repository } from 'typeorm';

type SeedStat = {
  dealerships: number;
  serviceBays: number;
  technicians: number;
  serviceTypes: number;
  customers: number;
  vehicles: number;
};

const SEED_COUNT = {
  dealerships: 3,
  perDealershipServiceBays: 10,
  perDealershipTechnicians: 10,
  serviceTypes: 10,
  customers: 10,
} as const;

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Dealership)
    private readonly dealershipRepo: Repository<Dealership>,
    @InjectRepository(ServiceBay)
    private readonly serviceBayRepo: Repository<ServiceBay>,
    @InjectRepository(Technician)
    private readonly technicianRepo: Repository<Technician>,
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepo: Repository<ServiceType>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    private readonly dataSource: DataSource,
  ) {}

  async run(): Promise<void> {
    const stat: SeedStat = {
      dealerships: 0,
      serviceBays: 0,
      technicians: 0,
      serviceTypes: 0,
      customers: 0,
      vehicles: 0,
    };

    const serviceTypes = await this.ensureServiceTypes(stat);
    const dealerships = await this.ensureDealerships(stat);
    const customers = await this.ensureCustomers(stat);

    await this.ensureServiceBays(dealerships, stat);
    await this.ensureTechnicians(dealerships, serviceTypes, stat);
    await this.ensureVehicles(customers, stat);
  }

  private mkVin(n: number): string {
    return `SV${String(n).padStart(15, '0')}`;
  }

  private async ensureServiceTypes(stat: SeedStat): Promise<ServiceType[]> {
    const codes = Array.from({ length: SEED_COUNT.serviceTypes }, (_v, i) => `SEED_ST_${i + 1}`);
    const existed = await this.serviceTypeRepo.find({ where: { code: In(codes) } });
    const byCode = new Map(existed.map((x) => [x.code, x]));

    const createRows: Partial<ServiceType>[] = [];
    for (let i = 0; i < SEED_COUNT.serviceTypes; i += 1) {
      const code = `SEED_ST_${i + 1}`;
      if (!byCode.has(code)) {
        createRows.push({
          code,
          name: `Seed Service Type ${i + 1}`,
          durationMinutes: ((i % 4) + 1) * 30,
        });
      }
    }

    if (createRows.length) {
      const saved = await this.serviceTypeRepo.save(createRows);
      stat.serviceTypes += saved.length;
      saved.forEach((row) => byCode.set(row.code, row));
    }

    return codes.map((code) => byCode.get(code)).filter((x): x is ServiceType => Boolean(x));
  }

  private async ensureDealerships(stat: SeedStat): Promise<Dealership[]> {
    const names = Array.from(
      { length: SEED_COUNT.dealerships },
      (_v, i) => `Seed Dealership ${i + 1}`,
    );
    const existed = await this.dealershipRepo.find({ where: { name: In(names) } });
    const byName = new Map(existed.map((x) => [x.name, x]));

    const createRows: Partial<Dealership>[] = [];
    for (let i = 0; i < SEED_COUNT.dealerships; i += 1) {
      const name = `Seed Dealership ${i + 1}`;
      if (!byName.has(name)) {
        createRows.push({
          name,
          address: `${100 + i} Seed Street`,
          city: 'Seed City',
          country: 'VN',
          timezone: 'UTC',
          openTime: '08:00:00',
          closeTime: '18:00:00',
        });
      }
    }

    if (createRows.length) {
      const saved = await this.dealershipRepo.save(createRows);
      stat.dealerships += saved.length;
      saved.forEach((row) => byName.set(row.name, row));
    }

    return names.map((name) => byName.get(name)).filter((x): x is Dealership => Boolean(x));
  }

  private async ensureCustomers(stat: SeedStat): Promise<Customer[]> {
    const emails = Array.from(
      { length: SEED_COUNT.customers },
      (_v, i) => `seed.customer${i + 1}@example.com`,
    );
    const existed = await this.customerRepo.find({ where: { email: In(emails) } });
    const byEmail = new Map(existed.map((x) => [x.email, x]));

    const createRows: Partial<Customer>[] = [];
    for (let i = 0; i < SEED_COUNT.customers; i += 1) {
      const email = `seed.customer${i + 1}@example.com`;
      if (!byEmail.has(email)) {
        createRows.push({
          name: `Seed Customer ${i + 1}`,
          email,
          phone: `090000${String(i + 1).padStart(4, '0')}`,
        });
      }
    }

    if (createRows.length) {
      const saved = await this.customerRepo.save(createRows);
      stat.customers += saved.length;
      saved.forEach((row) => byEmail.set(row.email, row));
    }

    return emails.map((email) => byEmail.get(email)).filter((x): x is Customer => Boolean(x));
  }

  private async ensureVehicles(customers: Customer[], stat: SeedStat): Promise<void> {
    const vins = customers.map((_v, i) => this.mkVin(i + 1));
    const existed = await this.vehicleRepo.find({ where: { vin: In(vins) } });
    const byVin = new Set(existed.map((x) => x.vin));

    const now = new Date().getFullYear();
    const createRows: Partial<Vehicle>[] = [];
    customers.forEach((customer, i) => {
      const vin = this.mkVin(i + 1);
      if (!byVin.has(vin)) {
        createRows.push({
          vin,
          make: `SeedMake${(i % 5) + 1}`,
          model: `SeedModel${(i % 4) + 1}`,
          year: now - (i % 6),
          customerId: customer.id,
        });
      }
    });

    if (createRows.length) {
      const saved = await this.vehicleRepo.save(createRows);
      stat.vehicles += saved.length;
    }
  }

  private async ensureServiceBays(dealerships: Dealership[], stat: SeedStat): Promise<void> {
    for (let i = 0; i < dealerships.length; i += 1) {
      const dealership = dealerships[i];
      const names = Array.from(
        { length: SEED_COUNT.perDealershipServiceBays },
        (_v, bayIdx) => `Seed Bay D${i + 1}-B${bayIdx + 1}`,
      );
      const existed = await this.serviceBayRepo.find({
        where: { dealershipId: dealership.id, name: In(names) },
      });
      const byName = new Set(existed.map((x) => x.name));

      const createRows = names
        .filter((name) => !byName.has(name))
        .map((name) => ({
          name,
          active: true,
          dealershipId: dealership.id,
        }));

      if (createRows.length) {
        const saved = await this.serviceBayRepo.save(createRows);
        stat.serviceBays += saved.length;
      }
    }
  }

  private async ensureTechnicians(
    dealerships: Dealership[],
    serviceTypes: ServiceType[],
    stat: SeedStat,
  ): Promise<void> {
    const serviceTypeIds = serviceTypes.map((x) => x.id);

    for (let i = 0; i < dealerships.length; i += 1) {
      const dealership = dealerships[i];
      const names = Array.from(
        { length: SEED_COUNT.perDealershipTechnicians },
        (_v, idx) => `Seed Tech D${i + 1}-T${idx + 1}`,
      );

      const existed = await this.technicianRepo.find({
        where: { dealershipId: dealership.id, name: In(names) },
      });
      const byName = new Set(existed.map((x) => x.name));

      const createRows: Partial<Technician>[] = names
        .filter((name) => !byName.has(name))
        .map((name) => ({
          name,
          active: true,
          dealershipId: dealership.id,
        }));

      if (createRows.length) {
        const saved = await this.technicianRepo.save(createRows);
        stat.technicians += saved.length;
      }

      const techList = await this.technicianRepo.find({
        where: { dealershipId: dealership.id, name: In(names) },
        relations: { serviceType: true },
      });

      for (const tech of techList) {
        const currentIds = new Set((tech.serviceType ?? []).map((x) => x.id));
        const addIds = serviceTypeIds.filter((id) => !currentIds.has(id));
        if (!addIds.length) continue;

        await this.dataSource
          .createQueryBuilder()
          .relation(Technician, 'serviceType')
          .of(tech.id)
          .add(addIds);
      }
    }
  }
}
