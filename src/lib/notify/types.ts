// Shared types for the notify module: the BookingConfirmation payload and the
// Notifier interface each channel (email, SMS) implements.
export type BookingConfirmation = {
  reference: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  serviceName: string;
  stylistName: string;
  whenLabel: string; // human-readable, salon-local
  priceLkr: number;
  durationMin: number;
};

// A customer-initiated change to an existing booking (cancel / reschedule).
// `newWhenLabel` is set only for reschedules.
export type BookingChange = {
  reference: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  serviceName: string;
  stylistName: string;
  whenLabel: string;      // the (old) appointment time, salon-local
  newWhenLabel?: string;  // the new time — reschedule only
};

export interface Notifier {
  sendBookingConfirmation(c: BookingConfirmation): Promise<void>;
  sendBookingCancelled(c: BookingChange): Promise<void>;
  sendBookingRescheduled(c: BookingChange): Promise<void>;
}
