import { EResourceType } from '../constants/appointment.constant';

export type Reservation = {
  resourceType: EResourceType;
  resourceId: number;
  slotStart: Date;
};
