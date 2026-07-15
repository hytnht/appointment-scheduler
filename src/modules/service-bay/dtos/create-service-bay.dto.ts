import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceBayDto {
  /**
   * @example 1
   */
  @IsInt()
  @IsNotEmpty()
  dealershipId: number;

  /**
   * @example "Bay 1"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  /**
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
