import {
  IoCube,
  IoCubeOutline,
  IoHome,
  IoHomeOutline,
  IoReceipt,
  IoReceiptOutline,
} from 'react-icons/io5';
import { Link, Outlet, useMatch } from 'react-router';

import { CartBar } from '@/components/cart-bar';
import { useCart } from '@/hooks/use-cart';
import { cx } from '@/lib/cx';

import styles from './layout.module.css';

/** Abas Inicio, Transacoes e Gerenciar, com a navbar fixa no rodape. */
export function TabsLayout() {
  const managing = useMatch('/manage') !== null;
  const transactions = useMatch('/transactions') !== null;
  const home = !managing && !transactions;

  return (
    <div className={cx(styles.fill, styles.withTabBar)}>
      <Outlet />
      <nav className={styles.tabBar}>
        <Link
          to="/"
          aria-current={home ? 'page' : undefined}
          className={cx(styles.tab, home && styles.tabActive)}
        >
          {home ? <IoHome size={24} /> : <IoHomeOutline size={24} />}
          Início
        </Link>
        <Link
          to="/transactions"
          aria-current={transactions ? 'page' : undefined}
          className={cx(styles.tab, transactions && styles.tabActive)}
        >
          {transactions ? <IoReceipt size={24} /> : <IoReceiptOutline size={24} />}
          Transações
        </Link>
        <Link
          to="/manage"
          aria-current={managing ? 'page' : undefined}
          className={cx(styles.tab, managing && styles.tabActive)}
        >
          {managing ? <IoCube size={24} /> : <IoCubeOutline size={24} />}
          Gerenciar
        </Link>
      </nav>
    </div>
  );
}

/** Telas da aba Inicio: mostram a barra do carrinho acima da navbar. */
export function HomeLayout() {
  const { totalUnits } = useCart();

  return (
    <div className={cx(styles.fill, totalUnits > 0 && styles.withCartBar)}>
      <Outlet />
      <CartBar />
    </div>
  );
}
