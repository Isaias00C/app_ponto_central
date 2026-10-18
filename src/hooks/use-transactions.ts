import { useCallback, useEffect, useState } from 'react';

import { errorMessage } from '@/lib/shirts';
import { fetchTransactions, type Transaction } from '@/lib/transactions';

/** Carrega as transacoes ao abrir a tela e de novo ao voltar pro app ou pra aba. */
export function useTransactions() {
  /** `null` enquanto a primeira carga nao terminou. */
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      fetchTransactions().then(
        (data) => {
          setTransactions(data);
          setError(null);
        },
        (e) => setError(errorMessage(e)),
      ),
    [],
  );

  useEffect(() => {
    reload();

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') reload();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [reload]);

  return { transactions, error, reload };
}
