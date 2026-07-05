'use client';
import { Fragment, useState } from 'react';
import { StaffBookingCard } from '@/components/staff/staff-booking-card';
import {
  applyStatus, applyReschedule, serviceLabel, nextUp, completionPercent,
  type StaffBooking, type AdminBookingStatus,
} from '@/lib/staff/view';

const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', hour12: true });

export function TodayView({
  initialBookings, services, dayTitle, showSetup,
}: {
  initialBookings: StaffBooking[];
  services: { id: string; name: string }[];
  dayTitle: string;
  showSetup?: boolean;
}) {
  const [bookings, setBookings] = useState<StaffBooking[]>(initialBookings);
  const onLocalChange = (id: string, status: AdminBookingStatus) =>
    setBookings((list) => applyStatus(list, id, status));
  const onLocalReschedule = (id: string, startsAt: string, endsAt: string) =>
    setBookings((list) => applyReschedule(list, id, startsAt, endsAt));

  // Captured once on mount: react-hooks/purity forbids Date.now() in render.
  const [nowMs] = useState(() => Date.now());
  const next = nextUp(bookings, new Date(nowMs).toISOString());
  const waiting = bookings.filter((b) => b.status === 'confirmed').length;
  const done = bookings.filter((b) => b.status === 'completed').length;
  const pct = completionPercent(bookings);
  const rest = bookings.filter((b) => b.id !== next?.id);
  // "Now" divider position: after the last appointment that already started.
  const nowIndex = rest.filter((b) => new Date(b.starts_at).getTime() <= nowMs).length;
  const nowLabel = `Now ${timeFmt.format(nowMs)}`;
  const nowMarker = (
    <div className="sd-now" role="separator" aria-label={nowLabel}>
      <span className="sd-now__label">{nowLabel}</span>
      <span className="sd-now__line" aria-hidden="true" />
    </div>
  );

  return (
    <div className="apage">
      {showSetup && (
        <a href="/staff/account" className="sd-setup">
          <b>Finish your public card</b>
          <span>Add your title and specialties, then turn on &quot;Show on website&quot; so clients can find you.</span>
        </a>
      )}
      <div className="ahead">
        <div>
          <span className="eyebrow">Staff desk</span>
          <h1 className="ahead__title">Today</h1>
        </div>
        <span className="sd-day">{dayTitle}</span>
      </div>

      <div className="sd-strip" role="group" aria-label="Today at a glance">
        <div className="sd-strip__item"><b>{bookings.length}</b><span>clients</span></div>
        <div className="sd-strip__item"><b>{waiting}</b><span>waiting</span></div>
        <div className="sd-strip__item"><b>{done}</b><span>done</span></div>
        <div className="sd-strip__bar" aria-label={`${pct}% of today completed`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      {next ? (
        <section className="sd-next">
          <h2 className="h-section sd-h">Up next · {timeFmt.format(new Date(next.starts_at))}</h2>
          <StaffBookingCard
            booking={next} serviceName={serviceLabel(services, next.service_id)} hero
            onLocalChange={onLocalChange} onLocalReschedule={onLocalReschedule}
          />
        </section>
      ) : (
        <section className="sd-next">
          <h2 className="h-section sd-h">All clear</h2>
          <p className="step__hint">No remaining confirmed appointments today.</p>
        </section>
      )}

      <section>
        <h2 className="h-section sd-h">Full day</h2>
        {rest.length === 0 && !next ? (
          <p className="step__hint">No appointments today. Enjoy the quiet ☕</p>
        ) : (
          <div className="sd-timeline">
            {rest.map((b, i) => (
              <Fragment key={b.id}>
                {i === nowIndex && nowMarker}
                <StaffBookingCard
                  booking={b} serviceName={serviceLabel(services, b.service_id)}
                  allowUndo onLocalChange={onLocalChange} onLocalReschedule={onLocalReschedule}
                />
              </Fragment>
            ))}
            {rest.length > 0 && nowIndex === rest.length && nowMarker}
          </div>
        )}
      </section>
    </div>
  );
}
