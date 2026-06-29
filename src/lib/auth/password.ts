// Pure password-strength rules + scoring used by the signup form's live meter.
// No side effects, so it is unit-tested (tests/password.test.ts).
export interface PasswordRule {
  id: 'len' | 'upper' | 'lower' | 'number' | 'symbol';
  label: string;
  test: (v: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'len', label: '8+ characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'Uppercase', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Lowercase', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: 'Number', test: (v) => /[0-9]/.test(v) },
  { id: 'symbol', label: 'Symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export interface PasswordCheck {
  results: { id: PasswordRule['id']; label: string; met: boolean }[];
  score: number;
  passed: boolean;
}

export function checkPassword(value: string): PasswordCheck {
  const results = PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, met: r.test(value) }));
  const score = results.filter((r) => r.met).length;
  return { results, score, passed: score === PASSWORD_RULES.length };
}
