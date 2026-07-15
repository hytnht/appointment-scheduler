import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetTechnicianQuery {
  @IsOptional()
  @IsBoolean()
  @Type(() => String)
  @Transform(({ value }) => ['1', 'true'].includes(value))
  active?: boolean;
}
