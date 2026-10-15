import { IoCart, IoChevronForward } from 'react-icons/io5';
import { Link } from 'react-router';

import { useCart } from '@/hooks/use-cart';
import { units } from '@/lib/format';

import styles from './cart-bar.module.css';
import layout from './layout.module.css';

/** Barra fixa acima da navbar com o resumo do carrinho; some quando o carrinho esta vazio. */
export function CartBar() {
  const { totalUnits } = useCart();
  if (totalUnits === 0) return null;

  return (
    <div className={layout.cartBar}>
      <Link to="/cart" aria-label={`Abrir carrinho com ${units(totalUnits)}`} className={styles.bar}>
        <IoCart size={22} />
        <span className={styles.text}>Carrinho: {units(totalUnits)}</span>
        <span className={styles.action}>Dar baixa</span>
        <IoChevronForward size={18} />
      </Link>
    </div>
  );
}
