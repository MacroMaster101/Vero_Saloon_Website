'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { blockSchemas, type BlockKey } from '@/lib/content/blocks';

type Result = { ok: true } | { error: string };
const PATH = '/admin/content';
const KEYS = Object.keys(blockSchemas) as BlockKey[];

// Build the per-block object from form fields, then validate with the block schema.
function readBlock(key: BlockKey, fd: FormData): Record<string, unknown> {
  if (key === 'quote') {
    return { stars: fd.get('stars'), text: fd.get('text'), by: fd.get('by') };
  }
  if (key === 'cta') {
    return {
      title: fd.get('title'), sub: fd.get('sub'),
      phoneLabel: fd.get('phoneLabel'), phoneHref: fd.get('phoneHref'),
    };
  }
  if (key === 'hero') {
    return {
      eyebrow: fd.get('eyebrow'),
      line1: fd.get('line1'),
      line2Em: fd.get('line2Em'),
      line3: fd.get('line3'),
      lead: fd.get('lead'),
    };
  }
  if (key === 'stats') {
    const cards = [0, 1, 2, 3].map((i) => ({
      value: fd.get(`value${i}`),
      label: fd.get(`label${i}`),
    }));
    return { cards };
  }
  if (key === 'contact') {
    return {
      address: fd.get('address'),
      plusCode: fd.get('plusCode'),
      phonePrimary: fd.get('phonePrimary'),
      phoneOther: fd.get('phoneOther'),
      facebookUrl: fd.get('facebookUrl'),
      footerBlurb: fd.get('footerBlurb'),
    };
  }
  // story
  return {
    eyebrow: fd.get('eyebrow'),
    heading: fd.get('heading'),
    paragraphs: String(fd.get('paragraphs') ?? '').split('\n\n').map((p) => p.trim()).filter(Boolean),
    sign: fd.get('sign'),
  };
}

export async function saveBlock(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const key = String(fd.get('key') ?? '') as BlockKey;
  if (!KEYS.includes(key)) return { error: 'Unknown content block' };

  const parsed = blockSchemas[key].safeParse(readBlock(key, fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const sb = await createClient();
  const { error } = await sb
    .from('site_content')
    .upsert({ key, value: parsed.data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return { error: error.message };

  revalidatePath(PATH);
  revalidatePath('/');
  return { ok: true };
}
