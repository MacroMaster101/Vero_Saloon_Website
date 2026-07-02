'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Profile } from '@/lib/supabase/auth';
import type { UserMetadata } from '@/lib/avatar';
import { ProfileModal } from '@/components/site/profile-modal';
import { BookingsModal } from './bookings-modal';
import { SettingsModal } from './settings-modal';

export type AccountModal = 'profile' | 'bookings' | 'settings';

const Ctx = createContext<{ openModal: (m: AccountModal) => void }>({ openModal: () => {} });
export function useAccountModals() { return useContext(Ctx); }

// Hosts the account popups (profile / bookings / settings) so any nav surface —
// the top-bar avatar menu or the mobile dock — can open them via context.
export function AccountModalsProvider({
  profile,
  userMetadata,
  children,
}: {
  profile: Profile | null;
  userMetadata?: UserMetadata | null;
  children: ReactNode;
}) {
  const [modal, setModal] = useState<AccountModal | null>(null);
  const close = () => setModal(null);
  const seed = profile?.email ?? profile?.fullName ?? 'guest';

  return (
    <Ctx.Provider value={{ openModal: setModal }}>
      {children}
      {profile && (
        <>
          <ProfileModal
            open={modal === 'profile'}
            onClose={close}
            seed={seed}
            initialName={profile.fullName ?? ''}
            initialPhone={profile.phone ?? ''}
            userMetadata={userMetadata}
            email={profile.email}
          />
          <BookingsModal open={modal === 'bookings'} onClose={close} />
          <SettingsModal open={modal === 'settings'} onClose={close} />
        </>
      )}
    </Ctx.Provider>
  );
}
