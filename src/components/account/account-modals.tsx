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
  hasPassword = true,
  locale = 'en',
  children,
}: {
  profile: Profile | null;
  userMetadata?: UserMetadata | null;
  hasPassword?: boolean;
  locale?: string;
  children: ReactNode;
}) {
  const [modal, setModal] = useState<AccountModal | null>(null);
  const close = () => setModal(null);
  const seed = profile?.email ?? profile?.fullName ?? 'guest';
  // Server tells us if a password exists at load; once the user sets one in
  // this session, treat them as a password user without needing a refresh.
  const [passwordSet, setPasswordSet] = useState(false);
  const accountHasPassword = hasPassword || passwordSet;

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
            locale={locale}
          />
          <BookingsModal open={modal === 'bookings'} onClose={close} locale={locale} />
          <SettingsModal
            open={modal === 'settings'}
            onClose={close}
            canDelete={profile.role === 'user'}
            hasPassword={accountHasPassword}
            onPasswordSet={() => setPasswordSet(true)}
            locale={locale}
          />
        </>
      )}
    </Ctx.Provider>
  );
}
