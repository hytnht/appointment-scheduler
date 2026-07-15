import { BadRequestException } from '@nestjs/common';
import { ServiceTypeErrorMessages } from './constants/service-type.message';
import { SLOT_SIZE_MINUTES } from '../appointment/contants/appointment.contanst';

export function validateDuration(minutes: number, slotSize = SLOT_SIZE_MINUTES): void {
  if (minutes <= 0 || minutes % slotSize !== 0)
    throw new BadRequestException(ServiceTypeErrorMessages.INVALID_DURATION);
}
