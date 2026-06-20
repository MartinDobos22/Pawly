import { useCallback, useEffect, useState } from 'react';
import { careStatusApi } from '../services/healthApi';
import type { PetCareStatus } from '../types/petHealth';
import i18n from '../i18n';

export interface UseCareStatusResult {
  statuses: PetCareStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCareStatus(): UseCareStatusResult {
  const [statuses, setStatuses] = useState<PetCareStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await careStatusApi.get();
      setStatuses(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (i18n.t('errors.loadHealthDataFailed', { ns: 'common' }) as string)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { statuses, loading, error, refetch };
}
