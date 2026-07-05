'use client';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

// The password field + show/hide eye toggle, shared by every password form
// (login, signup, reset, change-password). Wrapper/label/meter stay with the
// caller since those differ per surface; this owns only the .pw input+eye.
export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  required,
}: {
  id?: string;
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  autoComplete: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : {})}
      />
      <button
        type="button"
        className="pw__eye"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <Icon name={show ? 'eyeOff' : 'eye'} className="ic" size={18} />
      </button>
    </div>
  );
}
