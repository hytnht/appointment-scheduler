import { IsDateString, IsInt, IsPositive, Matches } from 'class-validator';
import { AppointmentErrorMessages } from '../constants/appointment.message';

export class CreateAppointmentDto {
  /**
   * @example 1
   */
  @IsInt()
  @IsPositive()
  dealershipId: number;
  /**
   * @example 1
   */
  @IsInt()
  @IsPositive()
  vehicleId: number;
  /**
   * @example 1
   */
  @IsInt()
  @IsPositive()
  serviceTypeId: number;
  /**
   * ISO8601 format
   * @example 2026-07-20T10:00:00.000Z
   */
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, {
    message: AppointmentErrorMessages.INVALID_TIME_FORMAT,
  })
  startAt: string;
}
