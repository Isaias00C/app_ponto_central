import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Volta para a tela anterior do app. Se a tela foi aberta direto pela URL (link, PWA reaberto),
 * nao ha tela anterior no historico do app: vai para `fallback`.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  const { key } = useLocation();

  return useCallback(() => {
    // A primeira location carregada pelo router tem a chave "default".
    if (key === 'default') navigate(fallback, { replace: true });
    else navigate(-1);
  }, [key, fallback, navigate]);
}
