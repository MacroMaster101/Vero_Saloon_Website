// Email channel: sends booking emails via Resend. Server-only (uses the
// secret API key). Implements the Notifier interface from ./types.
// Confirmations go to the customer; cancel/reschedule notices go to the
// customer AND (when SALON_NOTIFY_EMAIL is set) to the salon inbox.
import 'server-only';
import { Resend } from 'resend';
import type { Notifier, BookingConfirmation, BookingChange } from './types';
import { confirmationHtml, changeHtml, salonChangeHtml } from './templates';
import { env } from '@/lib/env';

export class ResendNotifier implements Notifier {
  private client(reference: string): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.info('[resend] RESEND_API_KEY not set — skipping email for booking', reference);
      return null;
    }
    return new Resend(apiKey);
  }

  async sendBookingConfirmation(c: BookingConfirmation): Promise<void> {
    const resend = this.client(c.reference);
    if (!resend || !c.customerEmail) return; // email optional
    await resend.emails.send({
      from: env.resendFrom,
      to: c.customerEmail,
      subject: `Vero Salon — booking confirmed (${c.reference})`,
      html: confirmationHtml(c),
    });
  }

  async sendBookingCancelled(c: BookingChange): Promise<void> {
    await this.sendChange(c, 'cancelled');
  }

  async sendBookingRescheduled(c: BookingChange): Promise<void> {
    await this.sendChange(c, 'rescheduled');
  }

  private async sendChange(c: BookingChange, kind: 'cancelled' | 'rescheduled'): Promise<void> {
    const resend = this.client(c.reference);
    if (!resend) return;
    const sends: Promise<unknown>[] = [];
    if (c.customerEmail) {
      sends.push(resend.emails.send({
        from: env.resendFrom,
        to: c.customerEmail,
        subject: `Vero Salon — booking ${kind} (${c.reference})`,
        html: changeHtml(c),
      }));
    }
    if (env.salonNotifyEmail) {
      sends.push(resend.emails.send({
        from: env.resendFrom,
        to: env.salonNotifyEmail,
        subject: `Booking ${kind}: ${c.reference} — ${c.customerName}`,
        html: salonChangeHtml(c),
      }));
    }
    await Promise.allSettled(sends);
  }
}
