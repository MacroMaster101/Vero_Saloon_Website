'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StarRow } from './star-row';

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  likes_count: number;
  created_at: string;
};

const LIKED_KEY = 'vero_liked_reviews';
const REPORTED_KEY = 'vero_reported_reviews';
const dateFmt = new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const [items, setItems] = useState<Review[]>(reviews);
  const [liked, setLiked] = useState<Set<string>>(() => readSet(LIKED_KEY));
  const [reported, setReported] = useState<Set<string>>(() => readSet(REPORTED_KEY));

  async function toggleLike(id: string) {
    const isLiked = liked.has(id);
    const delta = isLiked ? -1 : 1;
    // Optimistic
    setItems((list) => list.map((r) => (r.id === id ? { ...r, likes_count: Math.max(0, r.likes_count + delta) } : r)));
    const nextLiked = new Set(liked);
    if (isLiked) nextLiked.delete(id); else nextLiked.add(id);
    setLiked(nextLiked);
    writeSet(LIKED_KEY, nextLiked);

    const sb = createClient();
    const { error } = await sb.rpc('toggle_review_like', { p_review_id: id, p_delta: delta });
    if (error) {
      // Roll back optimistic state.
      setItems((list) => list.map((r) => (r.id === id ? { ...r, likes_count: Math.max(0, r.likes_count - delta) } : r)));
      const revert = new Set(nextLiked);
      if (isLiked) revert.add(id); else revert.delete(id);
      setLiked(revert);
      writeSet(LIKED_KEY, revert);
    }
  }

  async function report(id: string) {
    if (reported.has(id)) return;
    const next = new Set(reported).add(id);
    setReported(next);
    writeSet(REPORTED_KEY, next);
    const sb = createClient();
    await sb.rpc('report_review', { p_review_id: id });
  }

  if (items.length === 0) return null;

  return (
    <ul className="review-list">
      {items.map((r) => (
        <li key={r.id} className="review">
          <div className="review__head">
            <b className="review__name">{r.customer_name}</b>
            <StarRow rating={r.rating} />
          </div>
          {!!r.comment && <p className="review__comment">{r.comment}</p>}
          <div className="review__foot">
            <span className="review__date">{dateFmt.format(new Date(r.created_at))}</span>
            <button type="button" className={`review__like${liked.has(r.id) ? ' on' : ''}`} onClick={() => toggleLike(r.id)}>
              ♥ {r.likes_count}
            </button>
            <button type="button" className="review__report" disabled={reported.has(r.id)} onClick={() => report(r.id)}>
              {reported.has(r.id) ? 'Reported' : 'Report'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
