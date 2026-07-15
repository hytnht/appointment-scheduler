import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  /**
   * @example "Jane Doe"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  /**
   * @example "jane.doe@example.com"
   */
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  /**
   * @example "+1-555-867-5309"
   */
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;
}
