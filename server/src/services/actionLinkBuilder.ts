/**
 * Firebase Admin SDK generateEmailVerificationLink / generatePasswordResetLink
 * vracia URL ktorá ide cez Firebase action page (<project>.firebaseapp.com).
 * Aj keď nastavíme handleCodeInApp:true, pre web-only apps (bez Dynamic Link
 * Domain setupu) Firebase túto možnosť ignoruje a generuje default action URL.
 *
 * Tento helper extrahuje oobCode (a apiKey ak treba) z Firebase URL a postaví
 * URL priamo na našu doménu. Frontend potom spracuje verifikáciu/reset sám
 * cez applyActionCode / confirmPasswordReset.
 */

const APP_BASE_URL = 'https://pawly.sk';

export type ActionMode = 'verifyEmail' | 'resetPassword';

const MODE_TO_PATH: Record<ActionMode, string> = {
  verifyEmail: '/overenie-emailu',
  resetPassword: '/reset-hesla',
};

export function buildAppActionUrl(firebaseLink: string, mode: ActionMode): string {
  const url = new URL(firebaseLink);
  const oobCode = url.searchParams.get('oobCode');
  if (!oobCode) {
    throw new Error('Firebase link neobsahuje oobCode');
  }
  const apiKey = url.searchParams.get('apiKey');

  const target = new URL(MODE_TO_PATH[mode], APP_BASE_URL);
  target.searchParams.set('mode', mode);
  target.searchParams.set('oobCode', oobCode);
  if (apiKey) {
    target.searchParams.set('apiKey', apiKey);
  }
  return target.toString();
}
