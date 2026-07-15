import {
  IsMilitaryTime,
  IsNotEmpty,
  IsString,
  IsTimeZone,
  MaxLength,
} from 'class-validator';

export class CreateDealershipDto {
  /**
   * @example "Super Cars"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  /**
   * @example "123 Main St"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  /**
   * @example "New York"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  /**
   * @example "USA"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  /**
   * IANA Area/Location format
   * @example "America/New_York"
   */
  @IsTimeZone()
  @IsNotEmpty()
  @MaxLength(64)
  timezone: string;

  /**
   * HH:MM format (24-hour)
   * @example "09:00"
   */
  @IsMilitaryTime()
  @IsNotEmpty()
  openTime: string;

  /**
   * HH:MM format (24-hour)
   * @example "20:00"
   */
  @IsMilitaryTime()
  @IsNotEmpty()
  closeTime: string;
}
