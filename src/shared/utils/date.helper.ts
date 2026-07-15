import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function toUtc(date: string, time: string, timezone: string): Date {
  return dayjs.tz(`${date} ${time}`, timezone).utc().toDate();
}

export function toLocal(date: Date, timezone: string): Date {
  return dayjs(date).tz(timezone).toDate();
}
