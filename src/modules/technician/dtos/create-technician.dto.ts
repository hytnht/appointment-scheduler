import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTechnicianDto {
  /**
   * @example 1
   */
  @IsInt()
  @IsNotEmpty()
  dealershipId: number;

  /**
   * @example "John Doe"
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
  /**
   * @example [1, 2, 3]
   */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  serviceTypeIds?: number[];
}
