import type { IsoDate, TimeOfDay } from '../types/tournament';

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function parseTimeOfDay(value: string): { hour: number; minute: number } | null {
  const match = TIME_RE.exec(value);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

function getOffsetFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = offsetFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    offsetFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Diferença (ms) entre o horário local do fuso e UTC no instante informado. */
function timeZoneOffsetMs(instantMs: number, timeZone: string): number {
  const parts = getOffsetFormatter(timeZone).formatToParts(new Date(instantMs));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - Math.floor(instantMs / 1000) * 1000;
}

/** Converte data + horário locais de um fuso IANA em um instante absoluto. */
export function zonedDateTimeToInstant(date: IsoDate | string, time: TimeOfDay | string, timeZone: string): Date {
  const d = parseIsoDate(date);
  const t = parseTimeOfDay(time);
  if (!d || !t) throw new Error(`Data/horário inválidos: ${date} ${time}`);
  const naiveUtc = Date.UTC(d.year, d.month - 1, d.day, t.hour, t.minute);
  let instant = naiveUtc - timeZoneOffsetMs(naiveUtc, timeZone);
  const corrected = naiveUtc - timeZoneOffsetMs(instant, timeZone);
  if (corrected !== instant) instant = corrected;
  return new Date(instant);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('pt-BR', { timeZone, ...options });
}

/** "19:00" */
export function formatTime(date: Date, timeZone: string): string {
  return formatter(timeZone, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
}

/** "12/10/2026" */
export function formatDate(date: Date, timeZone: string): string {
  return formatter(timeZone, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** "12/10" */
export function formatDayMonth(date: Date, timeZone: string): string {
  return formatter(timeZone, { day: '2-digit', month: '2-digit' }).format(date);
}

/** "segunda-feira" */
export function formatWeekday(date: Date, timeZone: string, style: 'long' | 'short' = 'long'): string {
  return formatter(timeZone, { weekday: style }).format(date).replace('.', '');
}

/** "out" */
export function formatMonthShort(date: Date, timeZone: string): string {
  return formatter(timeZone, { month: 'short' }).format(date).replace('.', '');
}

/** Meio-dia local de uma data "AAAA-MM-DD", útil para formatar dias sem risco de virar a data. */
export function isoDateToDisplayInstant(date: string, timeZone: string): Date {
  return zonedDateTimeToInstant(date, '12:00', timeZone);
}

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function countdownParts(target: Date, now: Date): CountdownParts {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    totalMs,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}
