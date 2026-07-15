'use client';

import { useMemo, useState } from 'react';
import { money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';
import { t } from '@/lib/i18n/translations';
import type { Service } from '@/lib/supabase/types';

type Audience = 'him' | 'her' | 'both';

// Infer who a service is aimed at from its name/slug (no gender column exists).
// Explicitly-gendered names win; everything else is unisex → shown in both.
// Plurals/possessives matter: "Gents Cut" must hit the him branch, so the
// patterns allow s / 's endings ("gent" alone never matched "gents").
export function audienceOf(s: Service): Audience {
  const hay = `${s.slug} ${s.name}`.toLowerCase();
  const him = /\b(gents?|men'?s?|man|male|boys?|beard|shave|moustache|barber)\b/.test(hay);
  const her = /\b(ladies|lady|women'?s?|woman|female|girls?|bridal|bride|wedding|mani|pedi|manicure|pedicure|makeup|make-up)\b/.test(hay);
  if (him && !her) return 'him';
  if (her && !him) return 'her';
  return 'both';
}

function ServiceCard({ s, locale }: { s: Service; locale: string }) {
  const photo = servicePhoto(s);
  return (
    <div className="home-scard">
      {/* eslint-disable-next-line @next/next/no-img-element -- local defaults + remote admin uploads */}
      <img
        className="home-scard__photo"
        src={photo.type === 'img' ? photo.src : ''}
        data-fb={photo.type === 'img' ? (photo.fallbackSrc ?? '') : ''}
        alt=""
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          const fb = el.dataset.fb || '/images/services/hair.png';
          if (!el.dataset.fallback && el.src !== fb) { el.dataset.fallback = '1'; el.src = fb; }
        }}
      />
      <div className="home-scard__body">
        <div className="home-scard__top">
          <b className="home-scard__name">{t(s.name, locale)}</b>
          <span className="home-scard__price">{money(s.price_lkr)}</span>
        </div>
        {s.description && <p className="home-scard__desc">{t(s.description, locale)}</p>}
        <span className="home-scard__dur">{s.duration_min} {t('min', locale)}</span>
      </div>
    </div>
  );
}

export function ServicesTabs({ services, locale = 'en' }: { services: Service[]; featured?: Service | null; locale?: string }) {
  const [cat, setCat] = useState<'hair' | 'beauty'>('hair');
  const [aud, setAud] = useState<Audience>('both');

  const CATS: { id: 'hair' | 'beauty'; label: string }[] = [
    { id: 'hair', label: t('Hair services', locale) },
    { id: 'beauty', label: t('Beauty & bridal', locale) },
  ];
  const AUDIENCES: { id: Audience; label: string }[] = [
    { id: 'both', label: t('Everyone', locale) },
    { id: 'him', label: t('For him', locale) },
    { id: 'her', label: t('For her', locale) },
  ];

  // Services in the chosen category, filtered by audience. "Everyone" shows all
  // in the category; Him/Her show gendered + unisex services.
  const list = useMemo(() => {
    return services.filter((s) => {
      if (s.category !== cat) return false;
      if (aud === 'both') return true;
      const a = audienceOf(s);
      return a === aud || a === 'both';
    });
  }, [services, cat, aud]);

  return (
    <div className="home-svc">
      {/* main category tabs */}
      <div className="home-svc__cats" role="tablist" aria-label="Service category">
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            className={`home-svc__cat${cat === c.id ? ' is-on' : ''}`}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* him / her / everyone sub-filters */}
      <div className="home-svc__auds" role="tablist" aria-label="Who is this for">
        {AUDIENCES.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aud === a.id}
            className={`home-svc__aud${aud === a.id ? ' is-on' : ''}`}
            onClick={() => setAud(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="home-lead home-svc__empty">{t('No services in this group yet.', locale)}</p>
      ) : (
        <>
          <span className="home-swipe" aria-hidden="true">{t('swipe', locale)}</span>
          <div className="home-svc__cards">
            {list.map((s) => <ServiceCard key={s.id} s={s} locale={locale} />)}
          </div>
        </>
      )}
    </div>
  );
}
