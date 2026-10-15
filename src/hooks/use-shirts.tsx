import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/hooks/use-auth';
import { errorMessage, fetchShirts, type Shirt } from '@/lib/shirts';

type ShirtsContextValue = {
  /** `null` enquanto a primeira carga nao terminou. */
  shirts: Shirt[] | null;
  error: string | null;
  reload: () => Promise<void>;
};

const ShirtsContext = createContext<ShirtsContextValue | null>(null);

export function ShirtsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [shirts, setShirts] = useState<Shirt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState(userId);

  // Ao sair ou trocar de conta, descarta o estoque carregado para a conta anterior.
  if (ownerId !== userId) {
    setOwnerId(userId);
    setShirts(null);
    setError(null);
  }

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

  // Sem login o RLS nao devolve nada, entao so carrega com usuario.
  useEffect(() => {
    if (userId) reload();
  }, [userId, reload]);

  // O estoque tambem pode ser alterado por outra pessoa; atualiza ao voltar pro app ou pra aba.
  useEffect(() => {
    if (!userId) return;

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') reload();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [userId, reload]);

  const value = useMemo(() => ({ shirts, error, reload }), [shirts, error, reload]);

  return <ShirtsContext.Provider value={value}>{children}</ShirtsContext.Provider>;
}

export function useShirts(): ShirtsContextValue {
  const context = useContext(ShirtsContext);
  if (!context) throw new Error('useShirts deve ser usado dentro de <ShirtsProvider>.');
  return context;
}
