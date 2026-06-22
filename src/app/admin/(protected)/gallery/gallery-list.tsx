'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Switch, SubmitButton, FormStatus } from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
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

function EditRow({ g }: { g: GalleryItem }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateGalleryItem(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{g.title}</span>
        <span className="arow__meta">{g.tag}{g.is_active ? '' : ' · hidden'}</span>
      </div>
      <div className="arow__actions">
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
        <form action={deleteGalleryItem}>
          <input type="hidden" name="id" value={g.id} />
          <button type="submit" className="btn btn--danger-outline">Delete</button>
        </form>
      </div>
    </li>
  );
}

export function GalleryList({ items }: { items: GalleryItem[] }) {
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
          render={(rows) => <ul className="alist">{rows.map((g) => <EditRow key={g.id} g={g} />)}</ul>}
        />
      </div>
      <div className="acrud__form">
        <CreateForm />
      </div>
    </div>
  );
}
