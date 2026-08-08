// Renders a failed read instead of letting it fall through to an empty list.
//
// Several admin/owner screens fetched with `const { data } = ...`, discarding
// `error`. A failure then rendered as "no users" / "no upcoming blocks" /
// "no holidays yet" — indistinguishable from a genuinely empty table, on
// screens an operator acts on. An admin who reads "no blocks" books over
// blocked time; one who reads "no holidays" re-syncs closures that already
// exist. Pair this with `{!error && rows.length === 0 && <empty state/>}` so
// the empty copy only shows when the query actually succeeded.
export function LoadError({ what, error }: { what: string; error: { message: string } | null | undefined }) {
  if (!error) return null;
  return <p className="astatus astatus--err">Could not load {what}: {error.message}</p>;
}
