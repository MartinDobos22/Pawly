export type PasswordRuleKey = 'minLength' | 'uppercase' | 'lowercase' | 'digit';

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRuleStatus {
  key: PasswordRuleKey;
  ok: boolean;
}

export interface PasswordValidation {
  ok: boolean;
  rules: PasswordRuleStatus[];
}

export function validatePassword(password: string): PasswordValidation {
  const rules: PasswordRuleStatus[] = [
    { key: 'minLength', ok: password.length >= PASSWORD_MIN_LENGTH },
    { key: 'uppercase', ok: /[A-Z]/.test(password) },
    { key: 'lowercase', ok: /[a-z]/.test(password) },
    { key: 'digit', ok: /\d/.test(password) },
  ];
  return {
    ok: rules.every((r) => r.ok),
    rules,
  };
}
