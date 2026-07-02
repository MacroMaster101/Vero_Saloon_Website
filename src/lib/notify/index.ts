// Notification entry point: sends booking confirmations via the configured
// channels (email through Resend, WhatsApp staff alert via Meta Cloud API,
// SMS stubbed). Server-only. Failures here must
// never block a booking — callers treat notify as best-effort.
import 'server-only';
import type { BookingConfirmation, BookingChange } from './types';
import { ResendNotifier } from './resend';
import { SmsStubNotifier } from './sms-stub';
import { WhatsAppNotifier } from './whatsapp';

const channels = [new ResendNotifier(), new SmsStubNotifier(), new WhatsAppNotifier()];

// Notifications must never fail a confirmed booking — log and swallow.
export async function notifyBookingConfirmed(c: BookingConfirmation): Promise<void> {
  await Promise.allSettled(channels.map((ch) => ch.sendBookingConfirmation(c)));
}

export async function notifyBookingCancelled(c: BookingChange): Promise<void> {
  await Promise.allSettled(channels.map((ch) => ch.sendBookingCancelled(c)));
}

export async function notifyBookingRescheduled(c: BookingChange): Promise<void> {
  await Promise.allSettled(channels.map((ch) => ch.sendBookingRescheduled(c)));
}
