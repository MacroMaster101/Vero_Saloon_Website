'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { Service, Stylist } from '@/lib/supabase/types';
import { getAvailability, createBooking, type CreateResult } from '@/app/book/actions';
import { StepService } from './step-service';
import { StepStylist } from './step-stylist';
import { StepDate } from './step-date';
import { StepTime } from './step-time';
import { StepDetails, type StepDetailsHandle } from './step-details';
import { SummaryAside } from './summary-aside';
import { Confirmation } from './confirmation';
import { GuestRecentBookings } from './guest-recent';
import { saveGuestBooking } from '@/lib/guest-bookings';
import { money } from '@/lib/format';

// Steps: 0 Service · 1 Stylist · 2 Date · 3 Time · 4 Details · (5 = confirmation)
const STEP_LABELS = ['Service', 'Stylist', 'Date', 'Time', 'Details'] as const;
const LAST_STEP = 4; // Details; step 5 is the confirmation screen
const BOOK_HORIZON_DAYS = 60; // how far ahead the calendar lets you book

function localYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BookingWizard({
  services,
  stylists,
  onBackChange,
}: {
  services: Service[];
  stylists: Stylist[];
  /** Reports the header "Back" handler (null when Back isn't available). */
  onBackChange?: (back: (() => void) | null) => void;
}) {
  // Bookable date range for the calendar: today → today + horizon (salon-local).
  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    const max = new Date(now);
    max.setDate(now.getDate() + BOOK_HORIZON_DAYS);
    return { minDate: localYmd(now), maxDate: localYmd(max) };
  }, []);

  const [step, setStep] = useState(0);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
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

  // The chosen services, in selection order. Drives the summary + combined total.
  const chosenServices = useMemo(
    () => serviceIds.map((id) => services.find((s) => s.id === id)).filter((s): s is Service => Boolean(s)),
    [services, serviceIds],
  );

  // A synthetic "combined" service the summary/aside can render as one line:
  // name summarises the bundle, price + duration are the sums.
  const service = useMemo<Service | null>(() => {
    if (chosenServices.length === 0) return null;
    const first = chosenServices[0]!;
    const name = chosenServices.length === 1
      ? first.name
      : `${first.name} + ${chosenServices.length - 1} more`;
    return {
      ...first,
      name,
      price_lkr: chosenServices.reduce((sum, s) => sum + s.price_lkr, 0),
      duration_min: chosenServices.reduce((sum, s) => sum + s.duration_min, 0),
    };
  }, [chosenServices]);

  const stylistLabel = useMemo(() => {
    if (!stylistTouched) return null;
    if (stylistId === null) return 'Any available';
    return stylists.find((s) => s.id === stylistId)?.name ?? 'Any available';
  }, [stylistTouched, stylistId, stylists]);

  // "Mon, 7 Jul" for a chosen YYYY-MM-DD (parsed as a local date, no UTC drift).
  const dateLabel = useMemo(() => {
    if (!date) return null;
    const [y, m, d] = date.split('-').map(Number) as [number, number, number];
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }, [date]);

  const whenLabel = useMemo(() => {
    if (!date || !time || !dateLabel) return null;
    const [h, m] = time.split(':').map(Number) as [number, number];
    const period = h < 12 ? 'AM' : 'PM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const t = `${h12}:${String(m).padStart(2, '0')} ${period}`;
    return `${dateLabel} · ${t}`;
  }, [date, time, dateLabel]);

  // Fetch availability whenever we're on the date step and inputs change.
  const refetch = (d: string | null) => {
    if (serviceIds.length === 0 || !d) {
      setSlots([]);
      return;
    }
    startSlots(async () => {
      const res = await getAvailability({ serviceIds, stylistId, date: d });
      setSlots(res.slots);
    });
  };

  useEffect(() => {
    // Entering the Time step (3) triggers an availability fetch for the day the
    // user just picked on the calendar (external data sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (step === 3) refetch(date);
    // Intentionally only re-runs on step change; `date`/`refetch` are handled
    // imperatively via handlePickDate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stepValid =
    step === 0 ? serviceIds.length > 0
    : step === 1 ? stylistTouched
    : step === 2 ? date !== null
    : step === 3 ? time !== null
    : step === 4 ? detailsValid
    : false;

  // What the user still needs to do on the current step — shown next to Continue
  // when they try to advance before it's complete.
  const STEP_NEEDS = [
    'Pick at least one service to continue.',
    'Choose a stylist (or “Any stylist”) to continue.',
    'Pick a day to continue.',
    'Pick a time to continue.',
    'Fill in your details to continue.',
  ] as const;

  // A one-shot "why you can't continue" nudge: message + a shake on the content.
  const [needHint, setNeedHint] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  function handleService(id: string) {
    // Toggle the service in/out of the combined booking. Any change to the
    // bundle alters the total duration, so the chosen time is no longer valid.
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setTime(null);
  }

  function removeService(id: string) {
    setServiceIds((prev) => prev.filter((x) => x !== id));
    setTime(null);
  }

  function handleStylist(id: string | null) {
    // Clicking the already-selected stylist again clears the choice (toggle
    // off), matching the Service step. Resetting `touched` makes the step
    // invalid again until something is picked.
    if (stylistTouched && stylistId === id) {
      setStylistId(null);
      setStylistTouched(false);
      setTime(null);
      return;
    }
    setStylistId(id);
    setStylistTouched(true);
    setTime(null);
  }

  function handlePickDate(d: string) {
    // Clicking the selected day again clears it (toggle off). Any date change
    // invalidates the chosen time; slots are fetched on the Time step.
    setDate((prev) => (prev === d ? null : d));
    setTime(null);
  }

  function handlePickTime(t: string) {
    // Clicking the selected time again clears it (toggle off).
    setTime((prev) => (prev === t ? null : t));
  }

  function goBack() {
    setSubmitError(null);
    setNeedHint(null);
    setStep((s) => Math.max(0, s - 1));
  }

  // Tell the modal header whether Back is available (steps 1–LAST) so it can
  // render the Back control up beside the "Book your visit" title.
  useEffect(() => {
    onBackChange?.(step > 0 && step <= LAST_STEP ? goBack : null);
  }, [step, onBackChange]);


  // Flash the "you still need X" hint and shake the current step's content.
  function nudge() {
    setNeedHint(STEP_NEEDS[step] ?? null);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }

  function goNext() {
    setSubmitError(null);
    if (!stepValid) {
      // On the Details step, surface every field error at once so the user
      // sees exactly what's missing (not just a generic hint).
      if (step === LAST_STEP) void detailsRef.current?.validate();
      nudge();
      return;
    }
    setNeedHint(null);
    if (step < LAST_STEP) {
      setStep((s) => s + 1);
      return;
    }
    // Details step → submit
    void submit();
  }

  async function submit() {
    const values = await detailsRef.current?.validate();
    if (!values || serviceIds.length === 0 || !date || !time) return;
    setCustomerName(values.name);
    startSubmit(async () => {
      const res = await createBooking({
        ...values,
        serviceIds,
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
        setStep(LAST_STEP + 1); // confirmation screen
        return;
      }
      // A taken slot or a now-invalid time (past / outside hours) both mean the
      // chosen time no longer works: drop it, return to the Time step, and
      // refetch so the user picks from a freshened list.
      if (res.error === 'slot_taken' || res.error === 'closed') {
        setTime(null);
        setStep(3); // Time step
        setSubmitError(res.message);
        refetch(date);
        return;
      }
      setSubmitError(res.message);
    });
  }

  function restart() {
    setStep(0);
    setServiceIds([]);
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

  const nextLabel = step === LAST_STEP ? 'Confirm booking' : 'Continue';

  return (
    <>
    <div className={`home-modal__body${step > LAST_STEP ? ' home-modal__body--done' : ''}`}>
    {/* On the confirmation screen the summary + step rail are hidden so the
        success message is the single focus — the ticket already lists details. */}
    <div className={`book__card reveal in${step > LAST_STEP ? ' book__card--done' : ''}`} id="bookCard">
      {step <= LAST_STEP && (
        <SummaryAside
          service={service}
          stylistLabel={stylistLabel}
          whenLabel={whenLabel}
          variant="bar"
          chips={chosenServices}
          onRemoveService={step === 0 ? removeService : undefined}
        />
      )}
      <div className={`book__main${shake ? ' shake' : ''}`}>
        {step <= LAST_STEP && (
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
        )}

        {step === 0 && (
          <StepService services={services} selectedIds={serviceIds} onSelect={handleService} />
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
          <StepDate
            selectedDate={date}
            minDate={minDate}
            maxDate={maxDate}
            onPickDate={handlePickDate}
          />
        )}
        {step === 3 && (
          <StepTime
            dateLabel={dateLabel}
            slots={slots}
            loading={loadingSlots}
            selectedTime={time}
            onPickTime={handlePickTime}
          />
        )}
        {/* Keep details mounted from the Details step onward so RHF state
            survives a slot_taken bounce back to Time and forward again. */}
        <div style={{ display: step === 4 ? 'block' : 'none' }}>
          <StepDetails ref={detailsRef} onValidityChange={setDetailsValid} active={step === 4} />
        </div>
        {step === LAST_STEP + 1 && result && (
          <Confirmation result={result} customerName={customerName} onRestart={restart} />
        )}
      </div>

      {step <= LAST_STEP && (
        <SummaryAside
          service={service}
          stylistLabel={stylistLabel}
          whenLabel={whenLabel}
          chips={chosenServices}
          onRemoveService={step === 0 ? removeService : undefined}
        />
      )}
    </div>
    <GuestRecentBookings refreshKey={guestRefresh} />
    </div>

    {/* Fixed panel footer — pinned to the bottom of the popup window itself,
        outside the scroll area, so Continue + the live total never scroll away. */}
    {step <= LAST_STEP && (
      <div className="book__foot">
        {submitError ? (
          <span className="msg book__nav-msg">{submitError}</span>
        ) : needHint && !stepValid ? (
          <span className="msg book__nav-msg" role="alert">{needHint}</span>
        ) : (
          <span className="book__nav-total" aria-live="polite">
            {step === 0 && (
              <span className="book__nav-count">{chosenServices.length} selected</span>
            )}
            <b>{money(service?.price_lkr ?? 0)}</b>
          </span>
        )}
        {/* Continue stays clickable even when the step is incomplete so a click
            can explain what's needed (nudge); it only truly locks while submitting. */}
        <button
          type="button"
          className={`btn btn--primary${stepValid ? '' : ' is-blocked'}`}
          id="nextBtn"
          aria-disabled={!stepValid}
          disabled={submitting}
          onClick={goNext}
        >
          {submitting ? 'Booking…' : nextLabel}
        </button>
      </div>
    )}
    </>
  );
}
