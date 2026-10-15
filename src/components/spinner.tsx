import { cx } from '@/lib/cx';

import styles from './spinner.module.css';

/** Indicador de carregamento; herda a cor do texto (`color`) do elemento pai. */
export function Spinner({ large }: { large?: boolean }) {
  return <span className={cx(styles.spinner, large && styles.large)} role="status" aria-label="Carregando" />;
}
