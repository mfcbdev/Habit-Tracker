import clsx, { type ClassValue } from 'clsx';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

/** Minutes since midnight for an "HH:mm:ss" or "HH:mm" time string. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`;
}

/** "Today" must respect the user's stored timezone, not the browser's. */
export function getTodayInTimezone(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
}

export function getWeekdayInTimezone(timezone: string): number {
  // date-fns-tz has no direct "day of week in tz" helper, so format then re-derive.
  const dateStr = getTodayInTimezone(timezone);
  return new Date(`${dateStr}T00:00:00`).getDay();
}
