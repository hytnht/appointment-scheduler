import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class SearchAppointmentDto {
  /**
   * @example 1
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  dealershipId?: number;

  /**
   * @example 1
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  vehicleId?: number;

  /**
   * @default 1
   * @example 1
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  page = 1;

  /**
   * @default 20
   * @example 20
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100)
  limit = 20;
}
