import { useEffect, useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import { Page } from '@/components/page';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { useTransactions } from '@/hooks/use-transactions';
import { cx } from '@/lib/cx';
import { dateTime, units } from '@/lib/format';
import { getPaymentReceiptUrl } from '@/lib/payment-receipts';
import type { Transaction } from '@/lib/transactions';

import styles from './transactions-page.module.css';

export function TransactionsPage() {
  return (
    <Page title="Vendas">
      <Transactions />
    </Page>
  );
}

function Transactions() {
  const { transactions, error, reload } = useTransactions();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!transactions) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyView
        title="Nenhuma venda"
        message="As baixas de estoque feitas pelo carrinho aparecem aqui."
      />
    );
  }

  return (
    <ul className={styles.list}>
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          open={transaction.id === openId}
          onToggle={() => setOpenId(transaction.id === openId ? null : transaction.id)}
        />
      ))}
    </ul>
  );
}

type CardProps = {
  transaction: Transaction;
  open: boolean;
  onToggle: () => void;
};

function TransactionCard({ transaction, open, onToggle }: CardProps) {
  const detailsId = `transaction-${transaction.id}`;

  return (
    <li className={styles.card}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={onToggle}
        className={styles.summary}
      >
        <span className={styles.summaryText}>
          <span className={styles.date}>{dateTime(transaction.createdAt)}</span>
          <span className={styles.total}>{units(transaction.totalUnits)}</span>
        </span>
        <IoChevronDown size={22} className={cx(styles.chevron, open && styles.chevronOpen)} />
      </button>

      {open ? (
        <div id={detailsId} className={styles.details}>
          <ul className={styles.items}>
            {transaction.items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemDescription}>{item.description}</span>
                <span className={styles.itemMeta}>
                  Tamanho {item.size} · {item.quantity} un.
                </span>
              </li>
            ))}
          </ul>
          {transaction.receiptPath ? <Receipt path={transaction.receiptPath} /> : null}
        </div>
      ) : null}
    </li>
  );
}

type ReceiptState = { path: string; url: string | null; failed: boolean };

/** Comprovante da venda. O bucket e privado: pede um link temporario ao abrir. */
function Receipt({ path }: { path: string }) {
  const [state, setState] = useState<ReceiptState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPaymentReceiptUrl(path).then(
      (url) => !cancelled && setState({ path, url, failed: false }),
      () => !cancelled && setState({ path, url: null, failed: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [path]);

  const current = state?.path === path ? state : null;

  return (
    <div className={styles.receipt}>
      <span className={styles.receiptLabel}>Comprovante</span>
      {current?.url ? (
        <a href={current.url} target="_blank" rel="noreferrer">
          <img src={current.url} alt="Comprovante de pagamento" className={styles.receiptImage} />
        </a>
      ) : current?.failed ? (
        <p className={styles.itemMeta}>Não foi possível carregar o comprovante.</p>
      ) : (
        <p className={styles.itemMeta}>Carregando…</p>
      )}
    </div>
  );
}
