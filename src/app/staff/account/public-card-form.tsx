'use client';
import { useState, useTransition } from 'react';
import { updateMyPublicCard } from './card-actions';
import { parseCardInput } from '@/lib/staff/card-input';

// Live "what customers see" card + editable title/tags/visibility. Name and photo
// come from the profile form above; this preview mirrors the home-page member card.
export function PublicCardForm({
  displayName, avatarUrl, initialRole, initialTags, initialActive,
}: {
  displayName: string;
  avatarUrl: string;
  initialRole: string;
  initialTags: string[];
  initialActive: boolean;
}) {
  const [role, setRole] = useState(initialRole);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [active, setActive] = useState(initialActive);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  // Same sanitizer the server action uses, so the preview shows exactly what
  // will be saved; the public card only ever renders the first 3 tags.
  const previewTags = parseCardInput(role, tags).tags.slice(0, 3);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(false);
    start(async () => {
      const res = await updateMyPublicCard({ role, tags, isActive: active });
      if ('error' in res) setError(res.error); else setOk(true);
    });
  }

  return (
    <form onSubmit={save} className="panel account-panel sd-card-editor">
      <h2>Your public card</h2>
      <p className="pm__hint">This is exactly how you appear on the website and in the booking flow.</p>

      <div className="sd-card-preview">
        <article className="home-member" style={{ margin: 0 }}>
          <div className="home-member__photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt={displayName} />
          </div>
          <h3>{displayName || 'Your name'}</h3>
          <div className="home-member__role">{role || 'Your title'}</div>
          {previewTags.length > 0 && (
            <div className="home-member__tags">
              {previewTags.map((t) => <span className="home-tag" key={t}>{t}</span>)}
            </div>
          )}
        </article>
      </div>

      <label className="pm__field">
        <span>Job title</span>
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Gents Stylist" maxLength={80} />
      </label>
      <label className="pm__field">
        <span>Specialties (comma separated, max 6)</span>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Cuts, Colour, Beard" />
      </label>

      <label className="aswitch">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        <span className="track" />
        <span>Show on website</span>
      </label>
      <em className="pm__hint" style={{ fontStyle: 'normal' }}>
        {active ? 'Your card is visible to clients.' : 'Hidden — only admins can see your card.'}
      </em>

      {error && <p className="astatus astatus--err">{error}</p>}
      {ok && !error && (
        <p className="astatus astatus--ok">
          {active ? 'Saved — your card is live on the website.' : 'Saved — your card stays hidden until you turn it on.'}
        </p>
      )}

      <div className="pm__foot">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save card'}
        </button>
      </div>
    </form>
  );
}
