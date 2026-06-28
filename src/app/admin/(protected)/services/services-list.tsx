'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Segmented, Switch, SubmitButton, FormStatus } from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
import { createService, updateService, deleteService } from './actions';
import { money } from '@/lib/format';
import type { Service } from '@/lib/supabase/types';

function durationLabel(min: number): string {
  const h = Math.floor(min / 60); const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function ServiceFields({ s }: { s?: Service }) {
  return (
    <>
      <Field label="Name"><TextInput name="name" defaultValue={s?.name ?? ''} required /></Field>
      <Field label="Slug (optional)"><TextInput name="slug" defaultValue={s?.slug ?? ''} placeholder="auto from name" /></Field>
      <Field label="Description"><TextInput name="description" defaultValue={s?.description ?? ''} /></Field>
      <Field label="Category">
        <Segmented name="category" defaultValue={(s?.category ?? 'hair') as 'hair' | 'beauty'}
          options={[{ value: 'hair', label: 'Hair' }, { value: 'beauty', label: 'Beauty' }]} />
      </Field>
      <div className="atwo">
        <Field label="Price (LKR)"><TextInput name="price_lkr" type="number" min={0} defaultValue={s?.price_lkr ?? 0} required /></Field>
        <Field label="Duration (min)"><TextInput name="duration_min" type="number" min={1} defaultValue={s?.duration_min ?? 30} required /></Field>
      </div>
      <Field label="Icon"><TextInput name="icon" defaultValue={s?.icon ?? 'scissors'} /></Field>
      <ImageField name="image_url" label="Service photo" defaultValue={s?.image_url ?? ''} />
      <Field label="Sort order"><TextInput name="sort_order" type="number" defaultValue={s?.sort_order ?? 0} /></Field>
      <Switch name="bookable" label="Bookable" defaultChecked={s?.bookable ?? true} />
      <Switch name="is_active" label="Active (shown on site)" defaultChecked={s?.is_active ?? true} />
      <Switch name="is_featured" label="Featured (highlighted in the app)" defaultChecked={s?.is_featured ?? false} />
    </>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => createService(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="acard">
      <div className="acard__title">Add a service</div>
      <ServiceFields />
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Add service</SubmitButton>
    </form>
  );
}

function EditRow({ s }: { s: Service }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateService(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">{money(s.price_lkr)} · {durationLabel(s.duration_min)} · {s.category}{s.is_featured ? ' · featured' : ''}{s.is_active ? '' : ' · hidden'}</span>
      </div>
      <div className="arow__actions">
        <details className="arow__edit">
          <summary />
          <form action={action}>
            <input type="hidden" name="id" value={s.id} />
            <ServiceFields s={s} />
            <FormStatus state={state} />
            <div className="aform__foot">
              <SubmitButton pending={pending} />
              <button type="button" className="btn btn--ghost"
                onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}>
                Cancel
              </button>
            </div>
          </form>
        </details>
        <form action={deleteService}>
          <input type="hidden" name="id" value={s.id} />
          <button type="submit" className="btn btn--danger-outline">Delete</button>
        </form>
      </div>
    </li>
  );
}

export function ServicesList({ services }: { services: Service[] }) {
  const chips: FilterChip<Service>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'hair', label: 'Hair', match: (s) => s.category === 'hair' },
    { id: 'beauty', label: 'Beauty', match: (s) => s.category === 'beauty' },
    { id: 'featured', label: 'Featured', match: (s) => s.is_featured },
    { id: 'hidden', label: 'Hidden', match: (s) => !s.is_active },
  ];
  return (
    <div className="acrud">
      <div className="acrud__list">
        <ListToolbar
          items={services}
          placeholder="Search services…"
          searchText={(s) => `${s.name} ${s.category} ${s.slug}`}
          chips={chips}
          emptyLabel="No services match your filters."
          render={(rows) => <ul className="alist">{rows.map((s) => <EditRow key={s.id} s={s} />)}</ul>}
        />
      </div>
      <div className="acrud__form">
        <CreateForm />
      </div>
    </div>
  );
}
