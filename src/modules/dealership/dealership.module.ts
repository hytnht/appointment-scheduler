import { Module } from '@nestjs/common';
import { DealershipController } from './dealership.controller';
import { DealershipService } from './dealership.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dealership])],
  providers: [DealershipService],
  controllers: [DealershipController],
  exports: [DealershipService],
})
export class DealershipModule {}
