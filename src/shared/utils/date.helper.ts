import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function toUtc0(date: string, time: string, timezone: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);

  const localAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  let utcMs = localAsUtcMs;

  for (let step = 0; step < 3; step += 1) {
    const offsetMs = getTimezoneOffsetMs(new Date(utcMs), timezone);
    utcMs = localAsUtcMs - offsetMs;
  }

  return new Date(utcMs);
}

export function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, number>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});

  const tzAsUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return tzAsUtcMs - date.getTime();
}

export function toUtc(date: string, time: string, timezone: string): Date {
  return dayjs.tz(date, time, timezone).utc().toDate();
}

export function toLocal(date: Date, timezone: string): Date {
  return dayjs(date).tz(timezone).toDate();
}
