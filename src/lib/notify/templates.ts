// Renders the booking emails (confirmation + cancel/reschedule notices) as
// HTML bodies. Pure templating — no sending here (see ./resend).
import type { BookingConfirmation, BookingChange } from './types';
import { money } from '@/lib/format';

// Escape values interpolated into the confirmation HTML. customerName comes from
// user input; serviceName/stylistName from the DB. Email clients don't run JS, but
// escaping keeps the markup well-formed and avoids surprises if rendered elsewhere.
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function confirmationHtml(c: BookingConfirmation): string {
  const first = esc(c.customerName.split(' ')[0] ?? c.customerName);
  return `<div style="font-family:system-ui,sans-serif;max-width:520px">
    <h2 style="color:#A8132A">You're booked in, ${first}.</h2>
    <p>Your appointment at <b>Vero Salon</b> is confirmed.</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td>Reference</td><td align="right"><b>${esc(c.reference)}</b></td></tr>
      <tr><td>Service</td><td align="right">${esc(c.serviceName)}</td></tr>
      <tr><td>Stylist</td><td align="right">${esc(c.stylistName)}</td></tr>
      <tr><td>When</td><td align="right">${esc(c.whenLabel)}</td></tr>
      <tr><td>Duration</td><td align="right">${c.durationMin} min</td></tr>
      <tr><td>Pay at salon</td><td align="right"><b>${money(c.priceLkr)}</b></td></tr>
    </table>
    <p style="color:#897A7D">Free cancellation up to 2 hours before — just call 077 369 9620.</p>
  </div>`;
}

// Customer copy confirming their own cancellation / reschedule.
export function changeHtml(c: BookingChange): string {
  const first = esc(c.customerName.split(' ')[0] ?? c.customerName);
  const isReschedule = Boolean(c.newWhenLabel);
  return `<div style="font-family:system-ui,sans-serif;max-width:520px">
    <h2 style="color:#A8132A">${isReschedule ? `Booking moved, ${first}.` : `Booking cancelled, ${first}.`}</h2>
    <p>${isReschedule ? 'Your appointment at <b>Vero Salon</b> has a new time.' : 'Your appointment at <b>Vero Salon</b> has been cancelled.'}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td>Reference</td><td align="right"><b>${esc(c.reference)}</b></td></tr>
      <tr><td>Service</td><td align="right">${esc(c.serviceName)}</td></tr>
      <tr><td>Stylist</td><td align="right">${esc(c.stylistName)}</td></tr>
      ${isReschedule
        ? `<tr><td>Old time</td><td align="right">${esc(c.whenLabel)}</td></tr>
           <tr><td>New time</td><td align="right"><b>${esc(c.newWhenLabel!)}</b></td></tr>`
        : `<tr><td>Was booked for</td><td align="right">${esc(c.whenLabel)}</td></tr>`}
    </table>
    <p style="color:#897A7D">${isReschedule ? 'See you then!' : 'We hope to see you another time — book again anytime.'}</p>
  </div>`;
}

// Plain alert for the salon inbox (staff-facing, includes the contact number).
export function salonChangeHtml(c: BookingChange): string {
  const isReschedule = Boolean(c.newWhenLabel);
  return `<div style="font-family:system-ui,sans-serif;max-width:520px">
    <h2>${isReschedule ? 'Booking rescheduled' : 'Booking cancelled'} — ${esc(c.reference)}</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td>Customer</td><td align="right">${esc(c.customerName)}</td></tr>
      <tr><td>Phone</td><td align="right">${esc(c.customerPhone)}</td></tr>
      <tr><td>Service</td><td align="right">${esc(c.serviceName)}</td></tr>
      <tr><td>Stylist</td><td align="right">${esc(c.stylistName)}</td></tr>
      ${isReschedule
        ? `<tr><td>Old time</td><td align="right">${esc(c.whenLabel)}</td></tr>
           <tr><td>New time</td><td align="right"><b>${esc(c.newWhenLabel!)}</b></td></tr>`
        : `<tr><td>Was booked for</td><td align="right">${esc(c.whenLabel)}</td></tr>`}
    </table>
  </div>`;
}
