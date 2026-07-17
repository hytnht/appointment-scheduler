import { Appointment } from '../entities/appointment.entity';

export type AppointmentSearchResult = {
  items: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
