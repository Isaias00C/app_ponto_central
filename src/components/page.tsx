import type { ReactNode } from 'react';
import { IoChevronBack, IoClose } from 'react-icons/io5';

import { useGoBack } from '@/hooks/use-go-back';

import styles from './layout.module.css';

type Props = {
  title: string;
  /** Mostra o botao de voltar; o valor e a rota usada quando nao ha tela anterior. */
  backTo?: string;
  /** Tela no estilo modal (formularios, carrinho): o botao de voltar vira um "fechar". */
  modal?: boolean;
  children: ReactNode;
};

/** Tela com cabecalho fixo no topo. */
export function Page({ title, backTo, modal, children }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {backTo ? <BackButton fallback={backTo} modal={modal} /> : null}
        <h1 className={styles.title}>{title}</h1>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

function BackButton({ fallback, modal }: { fallback: string; modal?: boolean }) {
  const goBack = useGoBack(fallback);
  const Icon = modal ? IoClose : IoChevronBack;

  return (
    <button
      type="button"
      aria-label={modal ? 'Fechar' : 'Voltar'}
      onClick={goBack}
      className={styles.back}
    >
      <Icon size={26} />
    </button>
  );
}
