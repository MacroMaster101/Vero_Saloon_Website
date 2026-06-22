import type { Notifier, BookingConfirmation } from './types';

// Placeholder until a real SMS provider (Notify.lk / Twilio) is wired.
export class SmsStubNotifier implements Notifier {
  async sendBookingConfirmation(c: BookingConfirmation): Promise<void> {
    // Don't log the customer phone (PII). The reference is enough to trace.
    console.info(`[sms-stub] would text customer: booking ${c.reference} confirmed`);
  }
}
