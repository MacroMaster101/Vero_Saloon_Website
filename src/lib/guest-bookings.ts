// Device-local store of a guest's recent bookings, mirroring the mobile app's
// AsyncStorage guest store. This is NOT authoritative or synced — the durable
// recovery path is signing up with the same email (see historyOrFilter). Used
// only to show a returning guest their recent bookings on this browser.

export type GuestBooking = {
  reference: string;
  serviceName: string;
  stylistName: string;
  whenLabel: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  priceLkr?: number;
  createdAt: string; // ISO
};

const KEY = 'vero_guest_bookings';
const CAP = 20;
const STATUSES: readonly GuestBooking['status'][] = ['confirmed', 'completed', 'cancelled'];

export function isGuestBooking(value: unknown): value is GuestBooking {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.reference === 'string'
    && typeof v.serviceName === 'string'
    && typeof v.stylistName === 'string'
    && typeof v.whenLabel === 'string'
    && typeof v.status === 'string'
    && (STATUSES as readonly string[]).includes(v.status)
    && typeof v.createdAt === 'string'
  );
}

// Pure: filter invalid entries, dedupe by reference (first wins), cap length.
export function normalizeGuestList(raw: unknown, cap = CAP): GuestBooking[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: GuestBooking[] = [];
  for (const item of raw) {
    if (!isGuestBooking(item) || seen.has(item.reference)) continue;
    seen.add(item.reference);
    out.push(item);
    if (out.length >= cap) break;
  }
  return out;
}

// --- localStorage access (SSR-safe; swallows quota/parse errors) ---

export function readGuestBookings(): GuestBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeGuestList(JSON.parse(window.localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return [];
  }
}

export function saveGuestBooking(booking: GuestBooking): void {
  if (typeof window === 'undefined') return;
  const next = normalizeGuestList([booking, ...readGuestBookings()]);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode — ignore, this store is best-effort */
  }
}

export function updateGuestBookingStatus(reference: string, status: GuestBooking['status']): void {
  if (typeof window === 'undefined') return;
  const next = readGuestBookings().map((b) => (b.reference === reference ? { ...b, status } : b));
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
