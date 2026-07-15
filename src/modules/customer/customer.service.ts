import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { CustomerErrorMessages } from './constants/customer.message';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.customerRepo.find();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(CustomerErrorMessages.NOT_FOUND);
    return customer;
  }

  create(dto: CreateCustomerDto): Promise<Customer> {
    return this.customerRepo.save(dto);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const exists = await this.customerRepo.exists({ where: { id } });
    if (!exists) throw new NotFoundException(CustomerErrorMessages.NOT_FOUND);
    return this.customerRepo.save({ id, ...dto });
  }

  async delete(id: number): Promise<Customer> {
    const customer = await this.findOne(id);
    await this.customerRepo.delete(id);
    return customer;
  }
}
