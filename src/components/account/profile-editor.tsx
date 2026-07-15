'use client';
import { useRef, useState, useTransition } from 'react';
import { uploadAvatar, removeAvatar, updateProfileDetails, updateAvatarChoice } from '@/app/account/avatar-actions';
import { getAvatarInfo, dicebearUrl, type UserMetadata } from '@/lib/avatar';
import { t } from '@/lib/i18n/translations';

// The profile edit form (avatar chooser + name/phone/email) shared by the
// site's "Edit profile" popup and the dashboard Account pages. `onClose` is
// only passed by the popup — it renders the extra "Done" button.
export function ProfileEditor({
  seed,
  initialName,
  initialPhone,
  userMetadata,
  email,
  onClose,
  locale = 'en',
}: {
  seed: string;            // email/name used for the DiceBear fallback
  initialName: string;
  initialPhone: string;
  userMetadata: UserMetadata | null | undefined;
  email: string | null;
  onClose?: () => void;
  locale?: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const info = getAvatarInfo(userMetadata, seed);
  const [activeChoice, setActiveChoice] = useState<'custom' | 'dicebear' | 'email'>(info.choice);

  const [prevInitialName, setPrevInitialName] = useState<string>(initialName);
  const [prevInitialPhone, setPrevInitialPhone] = useState<string>(initialPhone);
  const [prevUserMetadata, setPrevUserMetadata] = useState<UserMetadata | null | undefined>(userMetadata);

  if (initialName !== prevInitialName) {
    setPrevInitialName(initialName);
    setName(initialName);
  }

  if (initialPhone !== prevInitialPhone) {
    setPrevInitialPhone(initialPhone);
    setPhone(initialPhone);
  }

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
    setError(null); setOk(false);
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const res = await uploadAvatar(fd);
      if ('error' in res) setError(res.error);
      else {
        setActiveChoice('custom');
        setOk(true);
      }
    });
  }

  function clearPhoto() {
    setError(null); setOk(false);
    start(async () => {
      const res = await removeAvatar();
      if ('error' in res) setError(res.error);
      else {
        setActiveChoice('dicebear');
        setOk(true);
      }
    });
  }

  function selectChoice(choice: 'custom' | 'dicebear' | 'email') {
    setError(null); setOk(false);
    start(async () => {
      const res = await updateAvatarChoice(choice);
      if ('error' in res) setError(res.error);
      else {
        setActiveChoice(choice);
        setOk(true);
      }
    });
  }

  function saveDetails() {
    setError(null); setOk(false);
    start(async () => {
      const res = await updateProfileDetails(name, phone);
      if ('error' in res) setError(res.error);
      else setOk(true);
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
    <>
        <div className="pm__avatar-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt={t('Your avatar', locale)} className="pm__avatar" />
          <div className="pm__avatar-actions">
            <button type="button" className="btn btn--ghost" disabled={pending}
              onClick={() => fileRef.current?.click()}>
              {pending ? t('Working…', locale) : t('Upload photo', locale)}
            </button>

            {info.emailAvatar && activeChoice !== 'email' && (
              <button type="button" className="btn btn--ghost" disabled={pending}
                onClick={() => selectChoice('email')}>
                {t('Use email photo', locale)}
              </button>
            )}

            {activeChoice !== 'dicebear' && (
              <button type="button" className="btn btn--ghost" disabled={pending}
                onClick={() => selectChoice('dicebear')}>
                {t('Use cartoon avatar', locale)}
              </button>
            )}

            {info.customAvatar && (
              <button type="button" className="btn btn--ghost-light" disabled={pending} onClick={clearPhoto}
                style={{ color: 'var(--error)', borderColor: 'color-mix(in srgb, var(--error) 40%, var(--line))' }}>
                {t('Delete photo', locale)}
              </button>
            )}

            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
            <p className="pm__hint">
              {t('JPG, PNG, WEBP or GIF · up to 5 MB.', locale)}
            </p>
          </div>
        </div>

        <label className="pm__field">
          <span>{t('Full name', locale)}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Your name', locale)} />
        </label>
        <label className="pm__field">
          <span>{t('Mobile number', locale)}</span>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07X XXX XXXX"
          />
        </label>
        <label className="pm__field">
          <span>{t('Email', locale)}</span>
          <input value={email ?? ''} disabled />
        </label>

        {error && <p className="astatus astatus--err">{error}</p>}
        {ok && !error && <p className="astatus astatus--ok">{t('Saved.', locale)}</p>}

        <div className="pm__foot">
          <button type="button" className="btn btn--primary" disabled={pending} onClick={saveDetails}>
            {pending ? t('Saving…', locale) : t('Save changes', locale)}
          </button>
          {onClose && <button type="button" className="btn btn--ghost" onClick={onClose}>{t('Done', locale)}</button>}
        </div>
    </>
  );
}
