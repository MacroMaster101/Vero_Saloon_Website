import { blockSchemas, type BlockKey } from '@/lib/content/blocks';
import type { z } from 'zod';

export type BlockOut<K extends BlockKey> = z.infer<(typeof blockSchemas)[K]>;

// Merge a (possibly partial/garbage) stored value over the typed default.
// safeParse with per-field defaults guarantees a complete, valid object.
// Pure — no server/next dependencies, so it is unit-testable in isolation.
export function mergeContent<K extends BlockKey>(key: K, value: unknown): BlockOut<K> {
  const base = (value && typeof value === 'object') ? value as Record<string, unknown> : {};
  const parsed = blockSchemas[key].safeParse(base);
  return (parsed.success ? parsed.data : blockSchemas[key].parse({})) as BlockOut<K>;
}
