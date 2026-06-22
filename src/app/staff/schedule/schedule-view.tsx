'use client';
import { useState } from 'react';
import { StatTiles, type StatTile } from '@/components/admin/stat-tiles';
import { StaffBookingCard } from '@/components/staff/staff-booking-card';
import { applyStatus, serviceLabel, groupByDay, type StaffBooking, type AdminBookingStatus } from '@/lib/staff/view';

export function ScheduleView({
  initialUpcoming, initialHistory, services,
}: {
  initialUpcoming: StaffBooking[];
  initialHistory: StaffBooking[];
  services: { id: string; name: string }[];
}) {
  const [upcoming, setUpcoming] = useState<StaffBooking[]>(initialUpcoming);
  const [history, setHistory] = useState<StaffBooking[]>(initialHistory);
  const onLocalChange = (id: string, status: AdminBookingStatus) => {
    setUpcoming((l) => applyStatus(l, id, status));
    setHistory((l) => applyStatus(l, id, status));
  };

  const groups = groupByDay(upcoming);
  const historyDesc = [...history].reverse();
  const confirmed = upcoming.filter((b) => b.status === 'confirmed').length;
  const completedHistory = history.filter((b) => b.status === 'completed').length;

  const tiles: StatTile[] = [
    { k: 'Upcoming', n: String(upcoming.length), sub: 'next 7 days' },
    { k: 'Waiting', n: String(confirmed), sub: 'confirmed' },
    { k: 'History', n: String(history.length), sub: 'past 30 days' },
    { k: 'Completed', n: String(completedHistory), sub: 'recent' },
  ];

  return (
    <div className="apage">
      <div className="ahead"><div><span className="eyebrow">Roster</span><h1 className="ahead__title">My week</h1></div></div>
      <p className="step__hint" style={{ marginTop: -10 }}>Upcoming appointments and recent history.</p>

      <StatTiles tiles={tiles} />

      <section style={{ marginTop: 28 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Upcoming schedule</h2>
        {groups.length === 0 ? (
          <p className="step__hint">No upcoming appointments this week.</p>
        ) : (
          groups.map((g) => (
            <div key={g.dayKey} style={{ marginBottom: 8 }}>
              <h3 className="h-section" style={{ fontSize: 15, margin: '14px 0 10px' }}>{g.dayLabel}</h3>
              {g.items.map((b) => (
                <StaffBookingCard key={b.id} booking={b} serviceName={serviceLabel(services, b.service_id)} onLocalChange={onLocalChange} />
              ))}
            </div>
          ))
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Recent history</h2>
        {historyDesc.length === 0 ? (
          <p className="step__hint">No history yet.</p>
        ) : (
          historyDesc.map((b) => (
            <StaffBookingCard key={b.id} booking={b} serviceName={serviceLabel(services, b.service_id)} allowUndo onLocalChange={onLocalChange} />
          ))
        )}
      </section>
    </div>
  );
}
