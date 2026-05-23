import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../config/firebase';

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
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
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
      throw mapFirebaseAuthError(err);
    }
  }, []);

  const logout = useCallback(async () => {
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
