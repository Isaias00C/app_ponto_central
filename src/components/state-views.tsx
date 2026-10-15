import { Button } from '@/components/button';
import { Spinner } from '@/components/spinner';

import styles from './state-views.module.css';

export function LoadingView() {
  return (
    <div className={styles.center}>
      <Spinner large />
    </div>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.center}>
      <h2 className={styles.title}>Não foi possível carregar</h2>
      <p className={styles.message}>{message}</p>
      <div>
        <Button label="Tentar novamente" onClick={onRetry} />
      </div>
    </div>
  );
}

export function EmptyView({ title, message }: { title: string; message?: string }) {
  return (
    <div className={styles.center}>
      <h2 className={styles.title}>{title}</h2>
      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  );
}
