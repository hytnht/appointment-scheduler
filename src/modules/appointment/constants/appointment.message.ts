export const AppointmentErrorMessages = {
  NOT_FOUND: 'Appointment not found',
  INVALID_TIME_FORMAT: 'Appointment start time must be in ISO8601 format',
  INVALID_GRID_ALIGNED: 'Appointment start time does not follow grid alignment',
  INVALID_BUSINESS_HOURS: 'Appointment time must be within business hours',
  NO_RESOURCE:
    'No qualified technician or active service bay is available for the requested time. Get the latest availability and retry.',
  DUPLICATE_VEHICLE_BOOKING: 'This vehicle already has an appointment at the requested time',
} as const;
