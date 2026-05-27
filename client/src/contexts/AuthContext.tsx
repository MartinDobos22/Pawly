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

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseAuthError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    logger.error('Firebase auth chyba', { code: err.code, message: err.message });
    switch (err.code) {
      case 'auth/invalid-email':
        return new Error('Neplatný formát e-mailu.');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new Error('Nesprávny e-mail alebo heslo.');
      case 'auth/email-already-in-use':
        return new Error('Tento e-mail je už zaregistrovaný.');
      case 'auth/weak-password':
        return new Error('Heslo musí mať aspoň 6 znakov.');
      case 'auth/too-many-requests':
        return new Error('Príliš veľa pokusov. Skús to neskôr.');
      case 'auth/popup-closed-by-user':
        return new Error('Prihlásenie cez Google bolo zrušené.');
      case 'auth/network-request-failed':
        return new Error('Chyba siete. Skontroluj pripojenie.');
      default:
        return new Error('Prihlásenie zlyhalo. Skús to znova.');
    }
  }
  return new Error('Prihlásenie zlyhalo. Skús to znova.');
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
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
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
    () => ({ user, loading, register, login, loginWithGoogle, logout, resetPassword }),
    [user, loading, register, login, loginWithGoogle, logout, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
