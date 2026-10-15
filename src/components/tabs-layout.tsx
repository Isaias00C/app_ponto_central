import { IoCube, IoCubeOutline, IoHome, IoHomeOutline } from 'react-icons/io5';
import { Link, Outlet, useMatch } from 'react-router';

import { CartBar } from '@/components/cart-bar';
import { useCart } from '@/hooks/use-cart';
import { cx } from '@/lib/cx';

import styles from './layout.module.css';

/** Abas Inicio e Gerenciar, com a navbar fixa no rodape. */
export function TabsLayout() {
  const managing = useMatch('/manage') !== null;

  return (
    <div className={cx(styles.fill, styles.withTabBar)}>
      <Outlet />
      <nav className={styles.tabBar}>
        <Link
          to="/"
          aria-current={managing ? undefined : 'page'}
          className={cx(styles.tab, !managing && styles.tabActive)}
        >
          {managing ? <IoHomeOutline size={24} /> : <IoHome size={24} />}
          Início
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
