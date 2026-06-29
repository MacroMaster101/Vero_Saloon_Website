// Notification entry point: sends booking confirmations via the configured
// channels (email through Resend, SMS stubbed). Server-only. Failures here must
// never block a booking — callers treat notify as best-effort.
import 'server-only';
import type { BookingConfirmation } from './types';
import { ResendNotifier } from './resend';
import { SmsStubNotifier } from './sms-stub';

const channels = [new ResendNotifier(), new SmsStubNotifier()];

// Notifications must never fail a confirmed booking — log and swallow.
export async function notifyBookingConfirmed(c: BookingConfirmation): Promise<void> {
  await Promise.allSettled(channels.map((ch) => ch.sendBookingConfirmation(c)));
}
