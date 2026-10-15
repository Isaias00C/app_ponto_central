import { useState } from 'react';
import { IoShirtOutline } from 'react-icons/io5';

import { cx } from '@/lib/cx';

import styles from './shirt-image.module.css';

type Props = {
  uri: string | null;
  /** Define o tamanho (largura/altura ou `aspect-ratio`). */
  className?: string;
};

export function ShirtImage({ uri, className }: Props) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = uri && failedUri !== uri;

  return (
    <div className={cx(styles.base, className)}>
      {showImage ? (
        <img src={uri} alt="" loading="lazy" className={styles.image} onError={() => setFailedUri(uri)} />
      ) : (
        <IoShirtOutline size={32} aria-hidden />
      )}
    </div>
  );
}
