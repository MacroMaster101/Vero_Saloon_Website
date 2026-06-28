'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { Service, Stylist } from '@/lib/supabase/types';
import { getAvailability, createBooking, type CreateResult } from '@/app/book/actions';
import { StepService } from './step-service';
import { StepStylist } from './step-stylist';
import { StepDateTime, type DateChip } from './step-datetime';
import { StepDetails, type StepDetailsHandle } from './step-details';
import { SummaryAside } from './summary-aside';
import { Confirmation } from './confirmation';
import { GuestRecentBookings } from './guest-recent';
import { saveGuestBooking } from '@/lib/guest-bookings';

const STEP_LABELS = ['Service', 'Stylist', 'Date & time', 'Details'] as const;

function buildDates(): DateChip[] {
  const out: DateChip[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dow = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    out.push({ value, dow, dom: String(d.getDate()) });
  }
  return out;
}

export function BookingWizard({ services, stylists }: { services: Service[]; stylists: Stylist[] }) {
  const dates = useMemo(() => buildDates(), []);

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [stylistId, setStylistId] = useState<string | null>(null);
  const [stylistTouched, setStylistTouched] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, startSlots] = useTransition();

  const [detailsValid, setDetailsValid] = useState(false);
  const detailsRef = useRef<StepDetailsHandle>(null);

  const [submitting, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<CreateResult, { ok: true }> | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [guestRefresh, setGuestRefresh] = useState(0);

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId]);

  const stylistLabel = useMemo(() => {
    if (!stylistTouched) return null;
    if (stylistId === null) return 'Any available';
    return stylists.find((s) => s.id === stylistId)?.name ?? 'Any available';
  }, [stylistTouched, stylistId, stylists]);

  const whenLabel = useMemo(() => {
    if (!date || !time) return null;
    const chip = dates.find((d) => d.value === date);
    const [h, m] = time.split(':').map(Number) as [number, number];
    const period = h < 12 ? 'AM' : 'PM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const t = `${h12}:${String(m).padStart(2, '0')} ${period}`;
    return `${chip ? chip.dow : date} · ${t}`;
  }, [date, time, dates]);

  // Fetch availability whenever we're on the date step and inputs change.
  const refetch = (d: string | null) => {
    if (!serviceId || !d) {
      setSlots([]);
      return;
    }
    startSlots(async () => {
      const res = await getAvailability({ serviceId, stylistId, date: d });
      setSlots(res.slots);
    });
  };

  useEffect(() => {
    // Entering the date step triggers an availability fetch (external data sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (step === 2) refetch(date);
    // Intentionally only re-runs on step change; `date`/`refetch` are handled
    // imperatively via handlePickDate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stepValid =
    step === 0 ? serviceId !== null
    : step === 1 ? stylistTouched
    : step === 2 ? date !== null && time !== null
    : step === 3 ? detailsValid
    : false;

  function handleService(id: string) {
    setServiceId(id);
    // service change invalidates any chosen time
    setTime(null);
  }

  function handleStylist(id: string | null) {
    setStylistId(id);
    setStylistTouched(true);
    setTime(null);
  }

  function handlePickDate(d: string) {
    setDate(d);
    setTime(null);
    refetch(d);
  }

  function goBack() {
    setSubmitError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    setSubmitError(null);
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    // step 3 → submit
    void submit();
  }

  async function submit() {
    const values = await detailsRef.current?.validate();
    if (!values || !serviceId || !date || !time) return;
    setCustomerName(values.name);
    startSubmit(async () => {
      const res = await createBooking({
        ...values,
        serviceId,
        stylistId,
        date,
        time,
      });
      if (res.ok) {
        // Persist guest bookings to this browser so a returning guest can see
        // them; logged-in users already have a server-backed history.
        if (res.isGuest) {
          saveGuestBooking({
            reference: res.reference,
            serviceName: res.serviceName,
            stylistName: res.stylistName,
            whenLabel: res.whenLabel,
            status: 'confirmed',
            priceLkr: res.priceLkr,
            createdAt: new Date().toISOString(),
          });
          setGuestRefresh((n) => n + 1);
        }
        setResult(res);
        setStep(4);
        return;
      }
      // A taken slot or a now-invalid time (past / outside hours) both mean the
      // chosen time no longer works: drop it, return to the date step, and
      // refetch so the user picks from a freshened list.
      if (res.error === 'slot_taken' || res.error === 'closed') {
        setTime(null);
        setStep(2);
        setSubmitError(res.message);
        refetch(date);
        return;
      }
      setSubmitError(res.message);
    });
  }

  function restart() {
    setStep(0);
    setServiceId(null);
    setStylistId(null);
    setStylistTouched(false);
    setDate(null);
    setTime(null);
    setSlots([]);
    setDetailsValid(false);
    setSubmitError(null);
    setResult(null);
    setCustomerName('');
  }

  const nextLabel = step === 3 ? 'Confirm booking' : 'Continue';

  return (
    <>
    <div className="book__card reveal in" id="bookCard">
      <SummaryAside service={service} stylistLabel={stylistLabel} whenLabel={whenLabel} variant="bar" />
      <div className="book__main">
        <div className="steps" id="steps">
          {STEP_LABELS.map((label, i) => {
            const cls = step > i ? 'done' : step === i ? 'active' : '';
            return (
              <div className={`steps__item${cls ? ' ' + cls : ''}`} data-step={i} key={label}>
                <div className="steps__bar" />
                <div className="steps__label">{label}</div>
              </div>
            );
          })}
        </div>

        {step === 0 && (
          <StepService services={services} selectedId={serviceId} onSelect={handleService} />
        )}
        {step === 1 && (
          <StepStylist
            stylists={stylists}
            selectedId={stylistId}
            touched={stylistTouched}
            onSelect={handleStylist}
          />
        )}
        {step === 2 && (
          <StepDateTime
            dates={dates}
            selectedDate={date}
            slots={slots}
            loading={loadingSlots}
            selectedTime={time}
            onPickDate={handlePickDate}
            onPickTime={setTime}
          />
        )}
        {/* Keep details mounted from step 3 onward so RHF state survives a
            slot_taken bounce back to step 2 and forward again. */}
        <div style={{ display: step === 3 ? 'block' : 'none' }}>
          <StepDetails ref={detailsRef} onValidityChange={setDetailsValid} active={step === 3} />
        </div>
        {step === 4 && result && (
          <Confirmation result={result} customerName={customerName} onRestart={restart} />
        )}

        {step < 4 && (
          <div className="book__nav" id="bookNav">
            <button
              type="button"
              className="btn btn--ghost"
              id="backBtn"
              style={{ display: step === 0 ? 'none' : undefined }}
              onClick={goBack}
            >
              Back
            </button>
            {submitError && (
              <span className="msg" style={{ display: 'block', marginRight: 'auto' }}>
                {submitError}
              </span>
            )}
            <button
              type="button"
              className="btn btn--primary"
              id="nextBtn"
              disabled={!stepValid || submitting}
              onClick={goNext}
            >
              {submitting ? 'Booking…' : nextLabel}
            </button>
          </div>
        )}
      </div>

      <SummaryAside service={service} stylistLabel={stylistLabel} whenLabel={whenLabel} />
    </div>
    <GuestRecentBookings refreshKey={guestRefresh} />
    </>
  );
}
