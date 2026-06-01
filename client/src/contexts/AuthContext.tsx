import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../config/firebase';
import { logger } from '../utils/logger';
import i18n from '../i18n';
import { requestVerificationEmail, type EmailLocale } from '../services/authEmailsApi';

function currentEmailLocale(): EmailLocale {
  return i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'sk';
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseAuthError(err: unknown): Error {
  const t = (k: string) => i18n.t(k as never, { ns: 'auth' }) as string;
  if (err instanceof FirebaseError) {
    logger.error('Firebase auth chyba', { code: err.code, message: err.message });
    switch (err.code) {
      case 'auth/invalid-email':
        return new Error(t('errors.invalidEmail'));
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new Error(t('errors.wrongCredentials'));
      case 'auth/email-already-in-use':
        return new Error(t('errors.emailInUse'));
      case 'auth/weak-password':
        return new Error(t('errors.weakPassword'));
      case 'auth/too-many-requests':
        return new Error(t('errors.tooManyRequests'));
      case 'auth/popup-closed-by-user':
        return new Error(t('errors.popupClosed'));
      case 'auth/network-request-failed':
        return new Error(t('errors.networkError'));
      default:
        return new Error(t('errors.loginFailed'));
    }
  }
  return new Error(t('errors.loginFailed'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Po návrate z Google redirectu zachyť prípadnú chybu (žiadna tichá biela obrazovka).
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          logger.info('loginWithGoogle (redirect): úspech', {
            uid: result.user.uid,
            email: result.user.email ?? undefined,
          });
        }
      })
      .catch((err) => {
        const fe = err as { code?: string; message?: string };
        logger.error('loginWithGoogle (redirect) zlyhal', {
          code: fe.code,
          message: fe.message,
        });
      });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      logger.info('Auth state zmena', {
        signedIn: Boolean(nextUser),
        uid: nextUser?.uid,
        email: nextUser?.email ?? undefined,
        provider: nextUser?.providerData?.[0]?.providerId,
      });
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Vnorený try/catch: zlyhanie poslania verification mailu nesmie zlomiť registráciu.
      // User sa dostane na /overenie-emailu kde môže Resend skúsiť znova.
      try {
        await cred.user.getIdToken(true);
        await requestVerificationEmail(currentEmailLocale());
      } catch (sendErr) {
        logger.warn('verification email po registrácii zlyhal', {
          reason: sendErr instanceof Error ? sendErr.message : String(sendErr),
        });
      }
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error(i18n.t('verify.notSignedIn', { ns: 'auth' }) as string);
    }
    await auth.currentUser.getIdToken(true);
    await requestVerificationEmail(currentEmailLocale());
  }, []);

  // Reload user state z Firebase backendu a sync React state.
  // Pre prípad keď reload() updatne IndexedDB ale onAuthStateChanged nefajruje.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    setUser(auth.currentUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      const userCancelled =
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled';
      if (userCancelled) {
        throw mapFirebaseAuthError(err);
      }
      // Popup blokovaný/nepodporovaný (in-app prehliadač, COOP) → fallback na redirect.
      logger.warn('loginWithGoogle: popup zlyhal, fallback na redirect', { code });
      try {
        await signInWithRedirect(auth, googleProvider);
        // stránka sa presmeruje; výsledok spracuje getRedirectResult + onAuthStateChanged po návrate
      } catch (redirectErr) {
        throw mapFirebaseAuthError(redirectErr);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    // Vyčisti user-špecifické localStorage kľúče, nech neunikajú medzi účtami
    // na zdieľanom prehliadači (dark-mode je neutrálna preferencia, tú nechávame).
    [
      'granule-check-food-safety-recent',
      'granule-check-active-pet-id',
      'granule-check-last-clinic-by-dog',
    ].forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      sendVerificationEmail,
      refreshUser,
    }),
    [
      user,
      loading,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      sendVerificationEmail,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
