import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateServiceTypeDto {
  /**
   * @example "OIL_CHANGE"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code: string;

  /**
   * @example "Oil Change"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  /**
   * @example 30
   */
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  durationMinutes: number;
}
