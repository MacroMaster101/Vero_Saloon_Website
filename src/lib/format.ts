// Display formatters for money (LKR) and clock times. Pure and dependency-free.

export function money(n: number): string {
  return 'LKR ' + n.toLocaleString('en-LK');
}

// minutes-from-midnight → "10:00 AM" / "12:00 AM" (1440 = midnight)
export function minutesToLabel(min: number): string {
  const m = min % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const period = h24 < 12 || h24 === 24 ? 'AM' : 'PM';
  let h12 = h24 % 12; if (h12 === 0) h12 = 12;
  // 1440 (midnight next day) and 0 both render as 12:00 AM
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
}
