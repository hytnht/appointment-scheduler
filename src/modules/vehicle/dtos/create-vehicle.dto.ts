import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateVehicleDto {
  /**
   * @example 1
   */
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  /**
   * @example "1HGCM82633A123456"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(17)
  vin: string;

  /**
   * @example "Honda"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  make: string;

  /**
   * @example "Civic"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model: string;

  /**
   * @example 2022
   */
  @IsInt()
  @IsNotEmpty()
  @Min(1900)
  @Max(2999)
  year: number;
}
