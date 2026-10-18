import { useState } from 'react';
import { IoAdd, IoCheckmarkCircle, IoRemove } from 'react-icons/io5';
import { useNavigate } from 'react-router';

import { Button } from '@/components/button';
import { Page } from '@/components/page';
import { ShirtImage } from '@/components/shirt-image';
import { ErrorView, LoadingView } from '@/components/state-views';
import { SIZES, type Size } from '@/constants/sizes';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useShirts } from '@/hooks/use-shirts';
import { confirmAction } from '@/lib/confirm';
import { cx } from '@/lib/cx';
import { deleteShirtImage } from '@/lib/shirt-images';
import { addStock, deleteShirt, errorMessage } from '@/lib/shirts';

import styles from './manage-page.module.css';

const MAX_QUANTITY = 9999;

type Feedback = { kind: 'success' | 'error'; text: string };

export function ManagePage() {
  return (
    <Page title="Cadastro">
      <Manage />
    </Page>
  );
}

function Manage() {
  const navigate = useNavigate();
  const { shirts, error, reload } = useShirts();
  const { session, signOut } = useAuth();
  const { removeShirt } = useCart();
  const [shirtId, setShirtId] = useState<string | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  const selected = shirts.find((shirt) => shirt.id === shirtId) ?? null;
  const amount = Number.parseInt(quantity, 10);
  const validAmount = Number.isInteger(amount) && amount > 0 && amount <= MAX_QUANTITY;
  const canSubmit = selected !== null && size !== null && validAmount;

  function changeQuantity(delta: number) {
    const next = Math.min(MAX_QUANTITY, Math.max(1, (Number.isInteger(amount) ? amount : 0) + delta));
    setQuantity(String(next));
  }

  async function onSignOut() {
    try {
      // Ao sair, o guarda de rotas leva para o login sozinho.
      await signOut();
    } catch (e) {
      setFeedback({ kind: 'error', text: errorMessage(e) });
    }
  }

  function confirmDelete() {
    if (!selected) return;

    confirmAction({
      title: 'Excluir camisa?',
      message: `"${selected.description}" e o estoque dela (${selected.total} un.) serão apagados. Isso não pode ser desfeito.`,
      onConfirm: removeSelected,
    });
  }

  async function removeSelected() {
    if (!selected) return;

    setDeleting(true);
    setFeedback(null);
    try {
      await deleteShirt(selected.id);
      await deleteShirtImage(selected.imageUrl);
      removeShirt(selected.id);
      setShirtId(null);
      await reload();
      setFeedback({ kind: 'success', text: 'Camisa excluída.' });
    } catch (e) {
      setFeedback({ kind: 'error', text: errorMessage(e) });
    } finally {
      setDeleting(false);
    }
  }

  async function submit() {
    if (!selected || !size || !validAmount) return;

    setSaving(true);
    setFeedback(null);
    try {
      const newQuantity = await addStock(selected.id, size, amount);
      await reload();
      setQuantity('1');
      setFeedback({
        kind: 'success',
        text: `+${amount} no tamanho ${size}. Estoque atual: ${newQuantity}.`,
      });
    } catch (e) {
      setFeedback({ kind: 'error', text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.content}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} id="manage-shirt">
          1. Camisa
        </h2>
        <div role="radiogroup" aria-labelledby="manage-shirt" className={styles.options}>
          {shirts.map((shirt) => {
            const active = shirt.id === shirtId;
            return (
              <button
                key={shirt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setShirtId(shirt.id)}
                className={cx(styles.option, active && styles.optionActive)}
              >
                <ShirtImage uri={shirt.imageUrl} className={styles.thumb} />
                <span className={styles.optionText}>{shirt.description}</span>
                {active ? <IoCheckmarkCircle size={22} className={styles.check} /> : null}
              </button>
            );
          })}
        </div>
        {selected ? (
          <div className={styles.rowActions}>
            <Button
              label="Editar"
              variant="secondary"
              onClick={() => navigate(`/edit-shirt/${selected.id}`)}
              disabled={deleting}
            />
            <Button label="Excluir" variant="danger" onClick={confirmDelete} loading={deleting} />
          </div>
        ) : null}
        <Button
          label="Cadastrar nova camisa"
          variant="secondary"
          onClick={() => navigate('/new-shirt')}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle} id="manage-size">
          2. Tamanho
        </h2>
        <div role="radiogroup" aria-labelledby="manage-size" className={styles.chips}>
          {SIZES.map((item) => {
            const active = item === size;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSize(item)}
                className={cx(styles.chip, active && styles.chipActive)}
              >
                <span className={styles.chipText}>{item}</span>
                {selected ? <span className={styles.chipStock}>{selected.stock[item]}</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <label htmlFor="manage-quantity">3. Quantidade a adicionar</label>
        </h2>
        <div className={styles.stepper}>
          <button
            type="button"
            aria-label="Diminuir quantidade"
            onClick={() => changeQuantity(-1)}
            className={styles.stepperButton}
          >
            <IoRemove size={24} />
          </button>
          <input
            id="manage-quantity"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value.replace(/\D/g, '').slice(0, 4))}
            onFocus={(event) => event.target.select()}
            className={styles.quantityInput}
          />
          <button
            type="button"
            aria-label="Aumentar quantidade"
            onClick={() => changeQuantity(1)}
            className={styles.stepperButton}
          >
            <IoAdd size={24} />
          </button>
        </div>
      </section>

      {feedback ? (
        <p className={cx('banner', feedback.kind === 'success' ? 'banner-success' : 'banner-error')}>
          {feedback.text}
        </p>
      ) : null}

      <Button label="Adicionar ao estoque" onClick={submit} disabled={!canSubmit} loading={saving} />

      <div className={styles.account}>
        <p className={styles.accountEmail}>{session?.user.email}</p>
        <Button label="Sair" variant="secondary" onClick={onSignOut} />
      </div>
    </div>
  );
}
