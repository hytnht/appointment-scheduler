import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class GetAvailabilityDto {
  /**
   * @example 1
   */
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  serviceTypeId: number;
  /** YYYY-MM-DD format
   * @example "2023-08-15"
   */
  @IsNotEmpty()
  @IsString()
  @IsDateString()
  @MaxLength(10)
  date: string;
}
