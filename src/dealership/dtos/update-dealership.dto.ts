import { PartialType } from '@nestjs/swagger';
import { CreateDealershipDto } from './create-dealership.dto';

export class UpdateDealershipDto extends PartialType(CreateDealershipDto) {}
