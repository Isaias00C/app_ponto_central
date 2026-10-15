import { Link } from 'react-router';

import { ShirtImage } from '@/components/shirt-image';
import type { Shirt } from '@/lib/shirts';

import styles from './shirt-card.module.css';

export function ShirtCard({ shirt }: { shirt: Shirt }) {
  return (
    <Link
      to={`/shirt/${shirt.id}`}
      aria-label={`${shirt.description}. Estoque total: ${shirt.total}`}
      className={styles.card}
    >
      <ShirtImage uri={shirt.imageUrl} className={styles.image} />
      <div className={styles.info}>
        <p className={styles.description}>{shirt.description}</p>
        <p className={styles.stock}>
          Estoque total: <strong className={styles.stockValue}>{shirt.total}</strong>
        </p>
      </div>
    </Link>
  );
}
