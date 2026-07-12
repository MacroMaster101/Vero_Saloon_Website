'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Switch, SubmitButton, FormStatus, DeleteForm } from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createStylist, updateStylist, deleteStylist } from './actions';
import { stylistAvatarSrc } from '@/lib/stylist-card';
import { dicebearUrl } from '@/lib/avatar';
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

/** Edit <details> + Delete — one instance per item, shared by row and card views. */
function StylistActions({ s }: { s: Stylist }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateStylist(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <>
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
      <DeleteForm action={deleteStylist} id={s.id} confirm={`Delete "${s.name}"?`} />
    </>
  );
}

function EditRow({ s }: { s: Stylist }) {
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">{s.role}{s.is_active ? '' : ' · hidden'}</span>
      </div>
      <div className="arow__actions">
        <StylistActions s={s} />
      </div>
    </li>
  );
}

function StylistCard({ s }: { s: Stylist }) {
  const tags = (s.tags ?? []).slice(0, 3).join(' · ');
  return (
    <MediaCard
      media={{ src: stylistAvatarSrc(s), fallbackSrc: dicebearUrl(s.slug || s.name), shape: 'avatar' }}
      title={s.name}
      meta={[s.role, tags].filter(Boolean).join(' — ') || 'Stylist'}
      badges={s.is_active ? [] : [{ label: 'Hidden', tone: 'hidden' as const }]}
    >
      <StylistActions s={s} />
    </MediaCard>
  );
}

export function StylistsList({ stylists }: { stylists: Stylist[] }) {
  const [mode, setMode] = useViewMode('stylists');
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
          right={<ViewToggle mode={mode} onChange={setMode} />}
          render={(rows) =>
            mode === 'cards'
              ? <ul className="mgrid">{rows.map((s) => <StylistCard key={s.id} s={s} />)}</ul>
              : <ul className="alist">{rows.map((s) => <EditRow key={s.id} s={s} />)}</ul>
          }
        />
      </div>
      <div className="acrud__form">
        <CreateForm />
      </div>
    </div>
  );
}
