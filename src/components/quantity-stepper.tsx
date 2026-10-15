import { IoAdd, IoRemove } from 'react-icons/io5';

import styles from './quantity-stepper.module.css';

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
};

export function QuantityStepper({ value, min = 0, max, onChange, label }: Props) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={styles.button}
      >
        <IoRemove size={20} />
      </button>
      <span className={styles.value} aria-label={`${label}: ${value}`}>
        {value}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={styles.button}
      >
        <IoAdd size={20} />
      </button>
    </div>
  );
}
