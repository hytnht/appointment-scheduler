export const SLOT_SIZE_MINUTES = 15;
export const GRID_ANCHOR_UTC = new Date('1970-01-01T00:00:00.000Z').getTime();
export const TOP_K_RESOURCES = 5;
export const DUPLICATE_VEHICLE_BOOKING_INDEX = 'sch_appointment_UQ_vehicleId_startAt_active';
export enum EResourceType {
  TECH = 'TECH',
  BAY = 'BAY',
}

export enum EAppointmentStatus {
  CANCELLED,
  CONFIRMED,
  COMPLETED,
  NO_SHOW,
}
