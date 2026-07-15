import { PartialType } from '@nestjs/swagger';
import { CreateServiceBayDto } from './create-service-bay.dto';

export class UpdateServiceBayDto extends PartialType(CreateServiceBayDto) {}
