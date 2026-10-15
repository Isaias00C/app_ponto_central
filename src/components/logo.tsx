import { cx } from '@/lib/cx';

import styles from './logo.module.css';

type Props = {
  className?: string;
};

/** Logo do Ponto Central, recortada em circulo (o arquivo tem fundo branco). */
export function Logo({ className }: Props) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo-ponto-central.jpg`}
      alt="Ponto Central"
      className={cx(styles.logo, className)}
    />
  );
}
