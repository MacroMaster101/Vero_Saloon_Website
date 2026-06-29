// Server-side read of editable site content: fetches the stored value for a
// block key and merges it over the typed default. Falls back to defaults if the
// DB read fails, so the page always renders.
import { createClient } from '@/lib/supabase/server';
import { type BlockKey } from '@/lib/content/blocks';
import { mergeContent, type BlockOut } from '@/lib/content/merge';

export { mergeContent } from '@/lib/content/merge';

export async function getSiteContent<K extends BlockKey>(key: K): Promise<BlockOut<K>> {
  try {
    const sb = await createClient();
    const { data } = await sb.from('site_content').select('value').eq('key', key).maybeSingle();
    return mergeContent(key, data?.value ?? {});
  } catch {
    return mergeContent(key, {});
  }
}
