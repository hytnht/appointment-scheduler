import { EResourceType } from '../contants/appointment.contanst';

export type Reservation = {
  resourceType: EResourceType;
  resourceId: number;
  slotStart: Date;
};
