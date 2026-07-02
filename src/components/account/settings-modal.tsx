'use client';
import { Modal } from '@/components/ui/modal';
import { ChangePassword } from './change-password';
import { DeleteAccount } from '@/app/account/delete-account';

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Change password</h3>
      <ChangePassword />
      <DeleteAccount />
    </Modal>
  );
}
