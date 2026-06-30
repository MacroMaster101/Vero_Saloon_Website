// The homepage has its own branded JS splash (see HomeEffects), so we suppress
// the app-level route loader here to avoid showing two loading screens on
// refresh. Other routes still use the root loading.tsx.
export default function Loading() {
  return null;
}
