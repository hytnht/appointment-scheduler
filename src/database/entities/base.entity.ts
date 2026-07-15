import { Timestamp } from '@src/database/entities/timestamp.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity extends Timestamp {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;
}
