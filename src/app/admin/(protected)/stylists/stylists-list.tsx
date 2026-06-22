'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Switch, SubmitButton, FormStatus } from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
import { createStylist, updateStylist, deleteStylist } from './actions';
import type { Stylist } from '@/lib/supabase/types';

function StylistFields({ s }: { s?: Stylist }) {
  return (
    <>
      <Field label="Name"><TextInput name="name" defaultValue={s?.name ?? ''} required /></Field>
      <Field label="Slug (optional)"><TextInput name="slug" defaultValue={s?.slug ?? ''} placeholder="auto from name" /></Field>
      <Field label="Role"><TextInput name="role" defaultValue={s?.role ?? ''} /></Field>
      <Field label="Tags (comma separated)"><TextInput name="tags" defaultValue={(s?.tags ?? []).join(', ')} /></Field>
      <ImageField name="avatar_url" label="Avatar" defaultValue={s?.avatar_url ?? ''} />
      <Field label="Sort order"><TextInput name="sort_order" type="number" defaultValue={s?.sort_order ?? 0} /></Field>
      <Switch name="is_active" label="Active (shown on site)" defaultChecked={s?.is_active ?? true} />
    </>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => createStylist(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="acard">
      <div className="acard__title">Add a stylist</div>
      <StylistFields />
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Add stylist</SubmitButton>
    </form>
  );
}

function EditRow({ s }: { s: Stylist }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateStylist(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">{s.role}{s.is_active ? '' : ' · hidden'}</span>
      </div>
      <div className="arow__actions">
        <details className="arow__edit">
          <summary />
          <form action={action}>
            <input type="hidden" name="id" value={s.id} />
            <StylistFields s={s} />
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
        <form action={deleteStylist}>
          <input type="hidden" name="id" value={s.id} />
          <button type="submit" className="btn btn--danger-outline">Delete</button>
        </form>
      </div>
    </li>
  );
}

export function StylistsList({ stylists }: { stylists: Stylist[] }) {
  const chips: FilterChip<Stylist>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'active', label: 'Active', match: (s) => s.is_active },
    { id: 'hidden', label: 'Hidden', match: (s) => !s.is_active },
  ];
  return (
    <div className="acrud">
      <div className="acrud__list">
        <ListToolbar
          items={stylists}
          placeholder="Search stylists…"
          searchText={(s) => `${s.name} ${s.role} ${(s.tags ?? []).join(' ')}`}
          chips={chips}
          emptyLabel="No stylists match your filters."
          render={(rows) => <ul className="alist">{rows.map((s) => <EditRow key={s.id} s={s} />)}</ul>}
        />
      </div>
      <div className="acrud__form">
        <CreateForm />
      </div>
    </div>
  );
}
