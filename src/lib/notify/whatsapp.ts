// WhatsApp channel: sends booking alerts to the salon's own number via the
// Meta WhatsApp Business Cloud API (template messages — the API requires
// pre-approved templates for business-initiated sends). Server-only (secret
// token). Skips when unconfigured; never throws — notifications must never
// break a booking.
import 'server-only';
import type { Notifier, BookingConfirmation, BookingChange } from './types';
import { env } from '@/lib/env';

// Template names must match the approved templates in Meta Business Manager,
// including the number and order of their {{n}} body variables (see the
// parameter arrays below). Unapproved templates simply fail + log.
const TEMPLATE_NEW = 'new_booking_alert';           // {{1}}..{{7}}
const TEMPLATE_CANCELLED = 'booking_cancelled_alert';   // {{1}}..{{5}}: name, service, when, reference, phone
const TEMPLATE_RESCHEDULED = 'booking_rescheduled_alert'; // {{1}}..{{6}}: name, service, old when, new when, reference, phone
const GRAPH_URL = 'https://graph.facebook.com/v20.0';

export class WhatsAppNotifier implements Notifier {
  async sendBookingConfirmation(c: BookingConfirmation): Promise<void> {
    // Order is the template's {{1}}..{{7}} contract — do not reorder.
    await this.sendTemplate(c.reference, TEMPLATE_NEW, [
      c.customerName, c.serviceName, c.stylistName, c.whenLabel,
      String(c.priceLkr), c.reference, c.customerPhone,
    ]);
  }

  async sendBookingCancelled(c: BookingChange): Promise<void> {
    await this.sendTemplate(c.reference, TEMPLATE_CANCELLED, [
      c.customerName, c.serviceName, c.whenLabel, c.reference, c.customerPhone,
    ]);
  }

  async sendBookingRescheduled(c: BookingChange): Promise<void> {
    await this.sendTemplate(c.reference, TEMPLATE_RESCHEDULED, [
      c.customerName, c.serviceName, c.whenLabel, c.newWhenLabel ?? '', c.reference, c.customerPhone,
    ]);
  }

  private async sendTemplate(reference: string, templateName: string, params: string[]): Promise<void> {
    const token = env.whatsappAccessToken;
    const phoneNumberId = env.whatsappPhoneNumberId;
    const salonNumber = env.whatsappSalonNumber;
    if (!token || !phoneNumberId || !salonNumber) {
      console.info(`[whatsapp] not configured — skipping alert for booking ${reference}`);
      return;
    }
    const payload = {
      messaging_product: 'whatsapp',
      to: salonNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [{
          type: 'body',
          // Meta rejects params with newlines, tabs, or 4+ consecutive spaces.
          parameters: params.map((text) => ({ type: 'text', text: text.replace(/\s+/g, ' ').trim() })),
        }],
      },
    };
    try {
      const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        // Response body has Meta's error detail; safe to log (no customer PII).
        const detail = await res.text().catch(() => '');
        console.error(`[whatsapp] ${templateName} send failed for booking ${reference}: ${res.status} ${detail}`);
      }
    } catch (err) {
      console.error(`[whatsapp] ${templateName} send error for booking ${reference}:`, err);
    }
  }
}
