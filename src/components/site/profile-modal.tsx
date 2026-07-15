'use client';
import { Modal } from '@/components/ui/modal';
import { ProfileEditor } from '@/components/account/profile-editor';
import type { UserMetadata } from '@/lib/avatar';
import { t } from '@/lib/i18n/translations';

// Popup wrapper around the shared profile editor (also used inline on the
// admin/owner Account pages).
export function ProfileModal({
  open,
  onClose,
  seed,
  initialName,
  initialPhone,
  userMetadata,
  email,
  locale = 'en',
}: {
  open: boolean;
  onClose: () => void;
  seed: string;            // email/name used for the DiceBear fallback
  initialName: string;
  initialPhone: string;
  userMetadata: UserMetadata | null | undefined;
  email: string | null;
  locale?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={t('Edit profile', locale)}>
      <ProfileEditor
        seed={seed}
        initialName={initialName}
        initialPhone={initialPhone}
        userMetadata={userMetadata}
        email={email}
        onClose={onClose}
        locale={locale}
      />
    </Modal>
  );
}
