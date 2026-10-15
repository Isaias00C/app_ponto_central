import { useEffect, useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';

import { Button } from '@/components/button';
import { Page } from '@/components/page';
import { QuantityStepper } from '@/components/quantity-stepper';
import { ShirtImage } from '@/components/shirt-image';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { useCart } from '@/hooks/use-cart';
import { useGoBack } from '@/hooks/use-go-back';
import { useShirts } from '@/hooks/use-shirts';
import { confirmAction } from '@/lib/confirm';
import { cx } from '@/lib/cx';
import { units } from '@/lib/format';
import { checkoutStock, errorMessage } from '@/lib/shirts';

import styles from './cart-page.module.css';

export function CartPage() {
  return (
    <Page title="Carrinho" backTo="/" modal>
      <Cart />
    </Page>
  );
}

function Cart() {
  const { shirts, error, reload } = useShirts();
  const { items, totalUnits, setQuantity, clear } = useCart();
  const goBack = useGoBack('/');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Garante o estoque atualizado antes de conferir o carrinho.
  useEffect(() => {
    reload();
  }, [reload]);

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  if (items.length === 0) {
    return done ? (
      <>
        <EmptyView title="Baixa realizada" message="O estoque foi atualizado." />
        <div className={styles.doneAction}>
          <Button label="Voltar" onClick={goBack} />
        </div>
      </>
    ) : (
      <EmptyView
        title="Carrinho vazio"
        message="Abra uma camisa e toque em + nos tamanhos para separar as unidades."
      />
    );
  }

  const rows = items.map((item) => {
    const shirt = shirts.find((candidate) => candidate.id === item.shirtId);
    const available = shirt?.stock[item.size] ?? 0;
    return { item, shirt, available, insufficient: item.quantity > available };
  });
  const hasInsufficient = rows.some((row) => row.insufficient);

  function confirm() {
    confirmAction({
      title: 'Dar baixa no estoque?',
      message: `${units(totalUnits)} serão retiradas do estoque.`,
      onConfirm: submit,
    });
  }

  async function submit() {
    setSaving(true);
    setFailure(null);
    try {
      await checkoutStock(items);
      clear();
      setDone(true);
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      await reload();
      setSaving(false);
    }
  }

  return (
    <div className={styles.content}>
      {rows.map(({ item, shirt, available, insufficient }) => (
        <div
          key={`${item.shirtId}:${item.size}`}
          className={cx(styles.row, insufficient && styles.rowInsufficient)}
        >
          <ShirtImage uri={shirt?.imageUrl ?? null} className={styles.thumb} />
          <div className={styles.info}>
            <p className={styles.description}>{shirt?.description ?? 'Camisa removida'}</p>
            <p className={styles.meta}>
              Tamanho {item.size} · {available} em estoque
            </p>
            {insufficient ? (
              <p className={styles.warning}>Estoque insuficiente para essa quantidade.</p>
            ) : null}
            <div className={styles.controls}>
              <QuantityStepper
                value={item.quantity}
                max={available}
                min={1}
                label={`${shirt?.description ?? 'camisa'} tamanho ${item.size}`}
                onChange={(value) => setQuantity(item.shirtId, item.size, value)}
              />
              <button
                type="button"
                aria-label="Remover do carrinho"
                onClick={() => setQuantity(item.shirtId, item.size, 0)}
                className={styles.remove}
              >
                <IoTrashOutline size={22} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <p className={styles.total}>Total: {units(totalUnits)}</p>

      {failure ? <p className="banner banner-error">{failure}</p> : null}

      <Button
        label="Dar baixa no estoque"
        onClick={confirm}
        disabled={hasInsufficient}
        loading={saving}
      />
      <Button label="Limpar carrinho" variant="secondary" onClick={clear} disabled={saving} />
    </div>
  );
}
