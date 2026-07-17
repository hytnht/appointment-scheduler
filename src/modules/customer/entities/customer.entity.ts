import { BaseEntity } from '@src/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Customer extends BaseEntity {
  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 320, unique: true })
  email: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  phone: string | null;
}
