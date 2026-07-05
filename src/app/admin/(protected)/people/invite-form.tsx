'use client';
import { useActionState } from 'react';
import { inviteStaff } from './actions';

// Email-only invite: creates the account (if new), a hidden shell stylist
// card, and the staff link in one action. Shown on admin People + owner Team.
export function InviteStaffForm() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => inviteStaff(fd),
    undefined as undefined | { ok: true; note?: string } | { error: string },
  );
  return (
    <form action={action} className="invite-staff">
      <input type="email" name="email" placeholder="person@email.com" required aria-label="Email to invite as staff" />
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? 'Inviting…' : 'Invite as staff'}
      </button>
      {state && 'error' in state && <p className="astatus astatus--err">{state.error}</p>}
      {state && 'ok' in state && <p className="astatus astatus--ok">{state.note ?? 'Done.'}</p>}
    </form>
  );
}
