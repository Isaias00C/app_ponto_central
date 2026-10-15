import { Spinner } from '@/components/spinner';
import { cx } from '@/lib/cx';

import styles from './button.module.css';

type Props = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  loading,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
      className={cx(styles.button, styles[variant])}
    >
      {loading ? <Spinner /> : label}
    </button>
  );
}
