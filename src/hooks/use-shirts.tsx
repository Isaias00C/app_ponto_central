import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { errorMessage, fetchShirts, type Shirt } from '@/lib/shirts';

type ShirtsContextValue = {
  /** `null` enquanto a primeira carga nao terminou. */
  shirts: Shirt[] | null;
  error: string | null;
  reload: () => Promise<void>;
};

const ShirtsContext = createContext<ShirtsContextValue | null>(null);

export function ShirtsProvider({ children }: { children: ReactNode }) {
  const [shirts, setShirts] = useState<Shirt[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      fetchShirts().then(
        (data) => {
          setShirts(data);
          setError(null);
        },
        (e) => setError(errorMessage(e)),
      ),
    [],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  // O estoque tambem pode ser alterado direto no Supabase; atualiza ao voltar pro app.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reload();
    });
    return () => subscription.remove();
  }, [reload]);

  const value = useMemo(() => ({ shirts, error, reload }), [shirts, error, reload]);

  return <ShirtsContext.Provider value={value}>{children}</ShirtsContext.Provider>;
}

export function useShirts(): ShirtsContextValue {
  const context = useContext(ShirtsContext);
  if (!context) throw new Error('useShirts deve ser usado dentro de <ShirtsProvider>.');
  return context;
}
