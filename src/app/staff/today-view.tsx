'use client';
import { useState } from 'react';
import { StatTiles, type StatTile } from '@/components/admin/stat-tiles';
import { StaffBookingCard } from '@/components/staff/staff-booking-card';
import {
  applyStatus, serviceLabel, nextUp, completionPercent,
  type StaffBooking, type AdminBookingStatus,
} from '@/lib/staff/view';

const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', hour12: true });

export function TodayView({
  initialBookings, services, dayTitle,
}: {
  initialBookings: StaffBooking[];
  services: { id: string; name: string }[];
  dayTitle: string;
}) {
  const [bookings, setBookings] = useState<StaffBooking[]>(initialBookings);
  const onLocalChange = (id: string, status: AdminBookingStatus) =>
    setBookings((list) => applyStatus(list, id, status));

  const next = nextUp(bookings, new Date().toISOString());
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;

  const tiles: StatTile[] = [
    { k: 'Clients', n: String(bookings.length), sub: 'today' },
    { k: 'Waiting', n: String(confirmed), sub: 'confirmed' },
    { k: 'Completed', n: String(completed), sub: `${completionPercent(bookings)}% done` },
    { k: 'Next', n: next ? timeFmt.format(new Date(next.starts_at)) : '—', sub: next ? 'appointment' : 'clear' },
  ];

  return (
    <div className="apage">
      <div className="ahead"><div><span className="eyebrow">Staff Desk</span><h1 className="ahead__title">Today</h1></div></div>
      <p className="step__hint" style={{ marginTop: -10 }}>{dayTitle}</p>

      <StatTiles tiles={tiles} />

      <section style={{ marginTop: 28 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Ready queue</h2>
        {next ? (
          <StaffBookingCard booking={next} serviceName={serviceLabel(services, next.service_id)} onLocalChange={onLocalChange} />
        ) : (
          <p className="step__hint">No remaining confirmed appointments today.</p>
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Appointment list</h2>
        {bookings.length === 0 ? (
          <p className="step__hint">No appointments today.</p>
        ) : (
          bookings.map((b) => (
            <StaffBookingCard key={b.id} booking={b} serviceName={serviceLabel(services, b.service_id)} onLocalChange={onLocalChange} />
          ))
        )}
      </section>
    </div>
  );
}
