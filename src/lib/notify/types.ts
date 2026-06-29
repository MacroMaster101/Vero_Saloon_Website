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

export interface Notifier {
  sendBookingConfirmation(c: BookingConfirmation): Promise<void>;
}
