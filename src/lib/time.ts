// Salon timezone helpers. Sri Lanka is UTC+5:30 with no DST, but compute the
// offset from the tz database so the code stays correct if reused elsewhere.
function tzOffsetMinutes(utcDate: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const parts: Record<string, string> = Object.fromEntries(dtf.formatToParts(utcDate).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour! % 24, +parts.minute!, +parts.second!);
  return (asUtc - utcDate.getTime()) / 60000;
}

export function toUtcInstant(date: string, minuteOfDay: number, tz: string): string {
  const dParts = date.split('-').map(Number);
  const y = dParts[0]!, m = dParts[1]!, d = dParts[2]!;
  const h = Math.floor(minuteOfDay / 60), min = minuteOfDay % 60;
  const guessUtc = Date.UTC(y, m - 1, d, h, min, 0);
  const offset = tzOffsetMinutes(new Date(guessUtc), tz);
  return new Date(guessUtc - offset * 60000).toISOString();
}

export function minutesOfDayInTz(iso: string, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
  const parts: Record<string, string> = Object.fromEntries(dtf.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return (+parts.hour! % 24) * 60 + +parts.minute!;
}
