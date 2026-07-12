'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Switch, SubmitButton, FormStatus, DeleteForm } from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from './actions';
import type { GalleryItem } from '@/lib/supabase/types';

function GalleryFields({ g }: { g?: GalleryItem }) {
  return (
    <>
      <Field label="Title"><TextInput name="title" defaultValue={g?.title ?? ''} required /></Field>
      <Field label="Tag"><TextInput name="tag" defaultValue={g?.tag ?? ''} /></Field>
      <Field label="Category / caption"><TextInput name="category" defaultValue={g?.category ?? ''} /></Field>
      <ImageField name="image_url" label="Image" defaultValue={g?.image_url ?? ''} />
      <Field label="Sort order"><TextInput name="sort_order" type="number" defaultValue={g?.sort_order ?? 0} /></Field>
      <Switch name="is_active" label="Active (shown on site)" defaultChecked={g?.is_active ?? true} />
    </>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => createGalleryItem(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="acard">
      <div className="acard__title">Add a gallery item</div>
      <GalleryFields />
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Add item</SubmitButton>
    </form>
  );
}

/** Edit <details> + Delete — one instance per item, shared by row and card views. */
function GalleryActions({ g }: { g: GalleryItem }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateGalleryItem(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <>
      <details className="arow__edit">
        <summary />
        <form action={action}>
          <input type="hidden" name="id" value={g.id} />
          <GalleryFields g={g} />
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
      <DeleteForm action={deleteGalleryItem} id={g.id} confirm={`Delete "${g.title}"?`} />
    </>
  );
}

function EditRow({ g }: { g: GalleryItem }) {
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{g.title}</span>
        <span className="arow__meta">{g.tag}{g.is_active ? '' : ' · hidden'}</span>
      </div>
      <div className="arow__actions">
        <GalleryActions g={g} />
      </div>
    </li>
  );
}

function GalleryCard({ g }: { g: GalleryItem }) {
  return (
    <MediaCard
      media={{ src: g.image_url || '/images/services/hair.png', fallbackSrc: '/images/services/hair.png' }}
      title={g.title}
      meta={[g.tag, g.category].filter(Boolean).join(' · ')}
      badges={g.is_active ? [] : [{ label: 'Hidden', tone: 'hidden' as const }]}
    >
      <GalleryActions g={g} />
    </MediaCard>
  );
}

export function GalleryList({ items }: { items: GalleryItem[] }) {
  const [mode, setMode] = useViewMode('gallery');
  const chips: FilterChip<GalleryItem>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'active', label: 'Active', match: (g) => g.is_active },
    { id: 'hidden', label: 'Hidden', match: (g) => !g.is_active },
  ];
  return (
    <div className="acrud">
      <div className="acrud__list">
        <ListToolbar
          items={items}
          placeholder="Search gallery…"
          searchText={(g) => `${g.title} ${g.tag} ${g.category}`}
          chips={chips}
          emptyLabel="No gallery items match your filters."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          render={(rows) =>
            mode === 'cards'
              ? <ul className="mgrid">{rows.map((g) => <GalleryCard key={g.id} g={g} />)}</ul>
              : <ul className="alist">{rows.map((g) => <EditRow key={g.id} g={g} />)}</ul>
          }
        />
      </div>
      <div className="acrud__form">
        <CreateForm />
      </div>
    </div>
  );
}
