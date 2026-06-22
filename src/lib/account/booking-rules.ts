// Pure rule for whether a user may cancel/reschedule one of their bookings.
// Enforced server-side (the booking RLS has no user-update policy, so mutations
// run through a service-role action that calls this before touching the row).

export type ModifiableBooking = {
  user_id: string | null;
  status: string;
  starts_at: string; // ISO
};

export type ModifyDecision = { ok: true } | { ok: false; reason: string };

export function canModifyBooking(
  booking: ModifiableBooking,
  userId: string,
  nowMs: number,
): ModifyDecision {
  if (booking.user_id == null || booking.user_id !== userId) {
    return { ok: false, reason: 'not_owner' };
  }
  if (booking.status !== 'confirmed') {
    return { ok: false, reason: 'not_active' };
  }
  if (new Date(booking.starts_at).getTime() < nowMs) {
    return { ok: false, reason: 'in_past' };
  }
  return { ok: true };
}
