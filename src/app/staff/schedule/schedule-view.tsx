'use client';
import { useState } from 'react';
import { StaffBookingCard } from '@/components/staff/staff-booking-card';
import {
  applyStatus, applyReschedule, serviceLabel, groupByDay,
  type StaffBooking, type AdminBookingStatus,
} from '@/lib/staff/view';

export function ScheduleView({
  initialUpcoming, initialHistory, services,
}: {
  initialUpcoming: StaffBooking[];
  initialHistory: StaffBooking[];
  services: { id: string; name: string }[];
}) {
  const [upcoming, setUpcoming] = useState<StaffBooking[]>(initialUpcoming);
  const [history, setHistory] = useState<StaffBooking[]>(initialHistory);
  const [showHistory, setShowHistory] = useState(false);

  const onLocalChange = (id: string, status: AdminBookingStatus) => {
    setUpcoming((l) => applyStatus(l, id, status));
    setHistory((l) => applyStatus(l, id, status));
  };
  const onLocalReschedule = (id: string, s: string, e: string) => {
    setUpcoming((l) => applyReschedule(l, id, s, e));
    setHistory((l) => applyReschedule(l, id, s, e));
  };

  const groups = groupByDay(upcoming);
  const historyDesc = [...history].reverse();
  const waiting = upcoming.filter((b) => b.status === 'confirmed').length;
  const doneRecent = history.filter((b) => b.status === 'completed').length;

  return (
    <div className="apage sd-week">
      <div className="ahead">
        <div><span className="eyebrow">Roster</span><h1 className="ahead__title">My week</h1></div>
      </div>

      <div className="sd-strip" role="group" aria-label="Week at a glance">
        <div className="sd-strip__item"><b>{upcoming.length}</b><span>upcoming</span></div>
        <div className="sd-strip__item"><b>{waiting}</b><span>waiting</span></div>
        <div className="sd-strip__item"><b>{doneRecent}</b><span>done · 30d</span></div>
      </div>

      {groups.length === 0 ? (
        <p className="step__hint">No upcoming appointments this week.</p>
      ) : (
        groups.map((g) => (
          <section key={g.dayKey} className="sd-daygroup">
            <h2 className="h-section sd-h sd-daygroup__head">{g.dayLabel}</h2>
            <div className="sd-timeline">
              {g.items.map((b) => (
                <StaffBookingCard
                  key={b.id} booking={b} serviceName={serviceLabel(services, b.service_id)}
                  onLocalChange={onLocalChange} onLocalReschedule={onLocalReschedule}
                />
              ))}
            </div>
          </section>
        ))
      )}

      <section style={{ marginTop: 30 }}>
        <button type="button" className="btn btn--ghost" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
          {showHistory ? 'Hide history' : `Recent history (${history.length})`}
        </button>
        {showHistory && (
          <div className="sd-timeline" style={{ marginTop: 12 }}>
            {historyDesc.length === 0 ? (
              <p className="step__hint">No history yet.</p>
            ) : (
              historyDesc.map((b) => (
                <StaffBookingCard
                  key={b.id} booking={b} serviceName={serviceLabel(services, b.service_id)}
                  allowUndo onLocalChange={onLocalChange} onLocalReschedule={onLocalReschedule}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
