'use client';
import { useActionState } from 'react';
import { saveBlock } from './actions';
import { saveHours } from './hours-actions';
import { Field, TextInput, TextArea, Switch, SubmitButton, FormStatus } from '@/components/admin/form-kit';
import type { QuoteContent, CtaContent, StoryContent, HeroContent, StatsContent, ContactContent } from '@/lib/content/blocks';
import type { BusinessHour } from '@/lib/supabase/types';
import { minutesToLabel } from '@/lib/format';

function useSave() {
  return useActionState(
    async (_p: unknown, fd: FormData) => saveBlock(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
}

export function HeroForm({ content }: { content: HeroContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="hero" />
      <div className="acard__title">Hero</div>
      <Field label="Eyebrow"><TextInput name="eyebrow" defaultValue={content.eyebrow} /></Field>
      <Field label="Display line 1"><TextInput name="line1" defaultValue={content.line1} /></Field>
      <Field label="Display line 2 (emphasized)"><TextInput name="line2Em" defaultValue={content.line2Em} /></Field>
      <Field label="Display line 3"><TextInput name="line3" defaultValue={content.line3} /></Field>
      <Field label="Lead paragraph"><TextArea name="lead" defaultValue={content.lead} rows={3} /></Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function StatsForm({ content }: { content: StatsContent }) {
  const [state, action, pending] = useSave();
  const cards = [0, 1, 2, 3].map((i) => content.cards[i] ?? { value: '', label: '' });
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="stats" />
      <div className="acard__title">Stats (4 cards)</div>
      {cards.map((c, i) => (
        <div key={i} className="atwo">
          <Field label={`Value ${i + 1}`}><TextInput name={`value${i}`} defaultValue={c.value} /></Field>
          <Field label={`Label ${i + 1}`}><TextInput name={`label${i}`} defaultValue={c.label} /></Field>
        </div>
      ))}
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function QuoteForm({ content }: { content: QuoteContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="quote" />
      <div className="acard__title">Testimonial quote</div>
      <Field label="Stars"><TextInput name="stars" defaultValue={content.stars} /></Field>
      <Field label="Quote"><TextArea name="text" defaultValue={content.text} rows={3} /></Field>
      <Field label="Attribution"><TextInput name="by" defaultValue={content.by} /></Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function CtaForm({ content }: { content: CtaContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="cta" />
      <div className="acard__title">Call to action</div>
      <Field label="Title"><TextInput name="title" defaultValue={content.title} /></Field>
      <Field label="Subtext"><TextArea name="sub" defaultValue={content.sub} rows={3} /></Field>
      <Field label="Phone button label"><TextInput name="phoneLabel" defaultValue={content.phoneLabel} /></Field>
      <Field label="Phone link (tel:…)"><TextInput name="phoneHref" defaultValue={content.phoneHref} /></Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function StoryForm({ content }: { content: StoryContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="story" />
      <div className="acard__title">Story section</div>
      <Field label="Eyebrow"><TextInput name="eyebrow" defaultValue={content.eyebrow} /></Field>
      <Field label="Heading"><TextInput name="heading" defaultValue={content.heading} /></Field>
      <Field label="Paragraphs (blank line between)"><TextArea name="paragraphs" defaultValue={content.paragraphs.join('\n\n')} rows={7} /></Field>
      <Field label="Sign-off"><TextInput name="sign" defaultValue={content.sign} /></Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function ContactForm({ content }: { content: ContactContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="contact" />
      <div className="acard__title">Contact &amp; footer</div>
      <Field label="Address"><TextInput name="address" defaultValue={content.address} /></Field>
      <Field label="Plus code"><TextInput name="plusCode" defaultValue={content.plusCode} /></Field>
      <Field label="Primary phone"><TextInput name="phonePrimary" defaultValue={content.phonePrimary} /></Field>
      <Field label="Other phones"><TextInput name="phoneOther" defaultValue={content.phoneOther} /></Field>
      <Field label="Facebook URL"><TextInput name="facebookUrl" defaultValue={content.facebookUrl} /></Field>
      <Field label="Footer blurb"><TextArea name="footerBlurb" defaultValue={content.footerBlurb} rows={2} /></Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

const DAY_LABELS: { dow: number; label: string }[] = [
  { dow: 1, label: 'Monday' }, { dow: 2, label: 'Tuesday' }, { dow: 3, label: 'Wednesday' },
  { dow: 4, label: 'Thursday' }, { dow: 5, label: 'Friday' }, { dow: 6, label: 'Saturday' },
  { dow: 0, label: 'Sunday' },
];
const TIME_OPTIONS: number[] = (() => { const o: number[] = []; for (let m = 0; m <= 1440; m += 30) o.push(m); return o; })();

export function HoursForm({ hours }: { hours: BusinessHour[] }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => saveHours(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  const byDow = new Map(hours.map((h) => [h.day_of_week, h]));
  return (
    <form action={action} className="acard">
      <div className="acard__title">Opening hours</div>
      {DAY_LABELS.map(({ dow, label }) => {
        const h = byDow.get(dow);
        const open = h?.open_minute ?? 600;
        const close = h?.close_minute ?? 1440;
        const closed = h?.is_closed ?? false;
        return (
          <div key={dow} className="ahours-row">
            <span style={{ fontSize: 13, color: 'var(--fg)' }}>{label}</span>
            <select className="ainput" name={`open_${dow}`} defaultValue={open} aria-label={`${label} open`}>
              {TIME_OPTIONS.map((m) => <option key={m} value={m}>{minutesToLabel(m)}</option>)}
            </select>
            <select className="ainput" name={`close_${dow}`} defaultValue={close} aria-label={`${label} close`}>
              {TIME_OPTIONS.map((m) => <option key={m} value={m}>{minutesToLabel(m)}</option>)}
            </select>
            <Switch name={`closed_${dow}`} label="Closed" defaultChecked={closed} />
          </div>
        );
      })}
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Save hours</SubmitButton>
    </form>
  );
}
