import { useParams } from 'react-router';

import { Page } from '@/components/page';
import { QuantityStepper } from '@/components/quantity-stepper';
import { ShirtImage } from '@/components/shirt-image';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { SIZES } from '@/constants/sizes';
import { useCart } from '@/hooks/use-cart';
import { useShirts } from '@/hooks/use-shirts';
import { cx } from '@/lib/cx';

import styles from './shirt-detail-page.module.css';

export function ShirtDetailPage() {
  return (
    <Page title="Tamanhos disponíveis" backTo="/">
      <ShirtDetail />
    </Page>
  );
}

function ShirtDetail() {
  const { id } = useParams<{ id: string }>();
  const { shirts, error, reload } = useShirts();
  const { quantityOf, setQuantity } = useCart();

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  const shirt = shirts.find((item) => item.id === id);
  if (!shirt) return <EmptyView title="Camisa não encontrada" />;

  return (
    <div className={styles.content}>
      <ShirtImage uri={shirt.imageUrl} className={styles.image} />
      <h2 className={styles.description}>{shirt.description}</h2>

      <p className={styles.hint}>
        Toque em + para separar unidades no carrinho e dar baixa no estoque (venda).
      </p>

      <div className={styles.sizes}>
        {SIZES.map((size) => {
          const available = shirt.stock[size];
          return (
            <div key={size} className={styles.row}>
              <div>
                <p className={styles.size}>{size}</p>
                <p className={cx(styles.quantity, available === 0 && styles.soldOut)}>
                  {available === 0 ? 'Esgotado' : `${available} em estoque`}
                </p>
              </div>
              <QuantityStepper
                value={quantityOf(shirt.id, size)}
                max={available}
                label={`tamanho ${size}`}
                onChange={(value) => setQuantity(shirt.id, size, value)}
              />
            </div>
          );
        })}
        <div className={styles.row}>
          <p className={styles.size}>Total</p>
          <p className={styles.size}>{shirt.total} un.</p>
        </div>
      </div>
    </div>
  );
}
