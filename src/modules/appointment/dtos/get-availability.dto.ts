import { IsDateString, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class GetAvailabilityDto {
  /**
   * @example 1
   */
  @IsNotEmpty()
  @IsNumber()
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
