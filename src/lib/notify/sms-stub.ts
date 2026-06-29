// Placeholder SMS channel: logs instead of sending, so the notify pipeline has a
// second channel wired up. Swap for a real SMS provider when one is chosen.
import type { Notifier, BookingConfirmation } from './types';

// Placeholder until a real SMS provider (Notify.lk / Twilio) is wired.
export class SmsStubNotifier implements Notifier {
  async sendBookingConfirmation(c: BookingConfirmation): Promise<void> {
    // Don't log the customer phone (PII). The reference is enough to trace.
    console.info(`[sms-stub] would text customer: booking ${c.reference} confirmed`);
  }
}
