'use client';
import { useRef, useState, useTransition } from 'react';
import { uploadAvatar, removeAvatar, updateName, updateAvatarChoice } from '@/app/account/avatar-actions';
import { getAvatarInfo, dicebearUrl, type UserMetadata } from '@/lib/avatar';

export function ProfileForm({
  fullName,
  email,
  role,
  userMetadata,
  seed,
}: {
  fullName: string;
  email: string;
  role: string;
  userMetadata: UserMetadata | null | undefined;
  seed: string;
}) {
  const [name, setName] = useState(fullName);
  const info = getAvatarInfo(userMetadata, seed);
  const [activeChoice, setActiveChoice] = useState<'custom' | 'dicebear' | 'email'>(info.choice);
  
  const [prevUserMetadata, setPrevUserMetadata] = useState<UserMetadata | null | undefined>(userMetadata);

  if (userMetadata !== prevUserMetadata) {
    setPrevUserMetadata(userMetadata);
    setActiveChoice(info.choice);
  }

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);
    setOk(false);
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const res = await uploadAvatar(fd);
      if ('error' in res) {
        setError(res.error);
      } else {
        setActiveChoice('custom');
        setOk(true);
      }
    });
  }

  function clearPhoto() {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await removeAvatar();
      if ('error' in res) {
        setError(res.error);
      } else {
        setActiveChoice('dicebear');
        setOk(true);
      }
    });
  }

  function selectChoice(choice: 'custom' | 'dicebear' | 'email') {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await updateAvatarChoice(choice);
      if ('error' in res) {
        setError(res.error);
      } else {
        setActiveChoice(choice);
        setOk(true);
      }
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    start(async () => {
      const res = await updateName(name);
      if ('error' in res) {
        setError(res.error);
      } else {
        setOk(true);
      }
    });
  }

  // Resolve preview image based on active choice state
  let shown = dicebearUrl(seed);
  if (activeChoice === 'custom' && info.customAvatar) {
    shown = info.customAvatar;
  } else if (activeChoice === 'email' && info.emailAvatar) {
    shown = info.emailAvatar;
  }

  return (
    <form onSubmit={handleSave} className="panel account-panel">
      <h2>Profile</h2>

      <div className="pm__avatar-row" style={{ borderBottom: '1px solid var(--line)', marginBottom: 20, paddingBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shown} alt="Your avatar" className="pm__avatar" />
        <div className="pm__avatar-actions">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            {pending ? 'Working…' : 'Upload photo'}
          </button>

          {info.emailAvatar && activeChoice !== 'email' && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={pending}
              onClick={() => selectChoice('email')}
            >
              Use email photo
            </button>
          )}

          {activeChoice !== 'dicebear' && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={pending}
              onClick={() => selectChoice('dicebear')}
            >
              Use cartoon avatar
            </button>
          )}

          {info.customAvatar && (
            <button
              type="button"
              className="btn btn--ghost-light"
              disabled={pending}
              onClick={clearPhoto}
              style={{ color: 'var(--error)', borderColor: 'color-mix(in srgb, var(--error) 40%, var(--line))' }}
            >
              Delete photo
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
          <p className="pm__hint">
            JPG, PNG, WEBP or GIF · up to 5 MB. Choose between an uploaded photo, your Google photo, or a cartoon avatar.
          </p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="acct-name">Full name</label>
        <input
          id="acct-name"
          name="full_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="acct-email">Email</label>
        <input id="acct-email" value={email} disabled />
      </div>
      <div className="field">
        <label htmlFor="acct-role">Role</label>
        <input id="acct-role" value={role} disabled />
      </div>

      <div style={{ minHeight: 24, marginBottom: 12 }}>
        {error && <p className="astatus astatus--err">{error}</p>}
        {ok && !error && <p className="astatus astatus--ok">Saved.</p>}
      </div>

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
