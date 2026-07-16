import { SLOT_SIZE_MINUTES } from '@src/modules/appointment/constants/appointment.constant';

export const ServiceTypeErrorMessages = {
  NOT_FOUND: 'Service type not found',
  INVALID_DURATION: `Duration must not be a multiple of ${SLOT_SIZE_MINUTES} minutes`,
} as const;
