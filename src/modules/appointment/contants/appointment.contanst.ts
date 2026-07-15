export const SLOT_SIZE_MINUTES = 15;
export const GRID_ANCHOR_UTC = new Date('1970-01-01T00:00:00.000Z').getTime();

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
