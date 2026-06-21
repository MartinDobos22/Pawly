import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getAdminStatus } from '../services/adminApi';

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
}

// Zistí, či je prihlásený používateľ admin (server overuje cez ADMIN_EMAILS).
export function useIsAdmin(): AdminState {
  const { user } = useAuth();
  const [state, setState] = useState<AdminState>({ isAdmin: false, loading: true });

  useEffect(() => {
    let active = true;
    if (!user) {
      setState({ isAdmin: false, loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    getAdminStatus()
      .then((isAdmin) => {
        if (active) setState({ isAdmin, loading: false });
      })
      .catch(() => {
        if (active) setState({ isAdmin: false, loading: false });
      });
    return () => {
      active = false;
    };
  }, [user]);

  return state;
}
