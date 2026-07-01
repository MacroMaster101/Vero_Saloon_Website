import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="afield"><span className="alabel">{label}</span>{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ainput" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="atextarea" {...props} />;
}

// Segmented: native radios styled as buttons. Submits `name=value`.
export function Segmented<T extends string>({ name, options, defaultValue }: {
  name: string;
  options: { value: T; label: string }[];
  defaultValue: T;
}) {
  return (
    <div className="aseg">
      {options.map((o) => (
        <label key={o.value} className="aseg__opt">
          <input type="radio" name={name} value={o.value} defaultChecked={o.value === defaultValue} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

// Switch: real checkbox styled as a toggle. Submits when checked, like before.
export function Switch({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="aswitch">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span className="track" />
      {label}
    </label>
  );
}

export function SubmitButton({ pending, children = 'Save', pendingLabel = 'Saving…' }: { pending?: boolean; children?: ReactNode; pendingLabel?: string }) {
  return <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? pendingLabel : children}</button>;
}

export function FormStatus({ state }: { state: undefined | { error: string } | { ok: true } }) {
  if (!state) return null;
  if ('error' in state) return <p className="astatus astatus--err">{state.error}</p>;
  return <p className="astatus astatus--ok">Saved.</p>;
}
