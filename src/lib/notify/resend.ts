import 'server-only';
import { Resend } from 'resend';
import type { Notifier, BookingConfirmation } from './types';
import { confirmationHtml } from './templates';
import { env } from '@/lib/env';

export class ResendNotifier implements Notifier {
  async sendBookingConfirmation(c: BookingConfirmation): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.info('[resend] RESEND_API_KEY not set — skipping email for booking', c.reference);
      return;
    }
    if (!c.customerEmail) return; // email optional
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: env.resendFrom,
      to: c.customerEmail,
      subject: `Vero Salon — booking confirmed (${c.reference})`,
      html: confirmationHtml(c),
    });
  }
}
