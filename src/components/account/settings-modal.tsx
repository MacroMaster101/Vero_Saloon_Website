'use client';
import { Modal } from '@/components/ui/modal';
import { ChangePassword } from './change-password';
import { DeleteAccount } from '@/app/account/delete-account';
import { t } from '@/lib/i18n/translations';

// canDelete gates the danger zone to customer accounts — staff/admin/owner
// manage removal from the People admin, never self-delete (it would orphan
// their chair/access).
export function SettingsModal({ open, onClose, canDelete = true, hasPassword = true, onPasswordSet, locale = 'en' }: { open: boolean; onClose: () => void; canDelete?: boolean; hasPassword?: boolean; onPasswordSet?: () => void; locale?: string }) {
  return (
    <Modal open={open} onClose={onClose} title={t('Settings', locale)}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>{hasPassword ? t('Change password', locale) : t('Set a password', locale)}</h3>
      {!hasPassword && (
        <p className="step__hint" style={{ margin: '-6px 0 14px' }}>
          {t('You signed up with Google. Add a password to also sign in with your email.', locale)}
        </p>
      )}
      <ChangePassword hasPassword={hasPassword} onPasswordSet={onPasswordSet} locale={locale} />
      {canDelete && <DeleteAccount locale={locale} />}
    </Modal>
  );
}
