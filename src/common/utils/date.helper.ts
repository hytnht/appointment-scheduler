import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function toUtc(date: string, time: string, timezone: string): Date;
export function toUtc(dateTime: string | Date): Date;
export function toUtc(date: string | Date, time?: string, timezone?: string): Date {
  if (typeof date === 'string' && time && timezone)
    return dayjs.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss', timezone).utc().toDate();
  else return dayjs(date).utc().toDate();
}

export function toLocal(date: Date, timezone: string): Date {
  return dayjs(date).tz(timezone).toDate();
}

export default dayjs;
