import { useCallback, useRef, useState } from 'react';
import ConfirmDialog, { type ConfirmDialogProps } from '../components/ConfirmDialog';

type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel' | 'loading'>;

interface State extends ConfirmOptions {
  open: boolean;
  loading: boolean;
}

const INITIAL_STATE: State = {
  open: false,
  loading: false,
  title: '',
  message: '',
};

export function useConfirm() {
  const [state, setState] = useState<State>(INITIAL_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, open: true, loading: false });
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false, loading: false }));
  }, []);

  const dialog = (
    <ConfirmDialog {...state} onConfirm={() => close(true)} onCancel={() => close(false)} />
  );

  return { confirm, dialog } as const;
}
