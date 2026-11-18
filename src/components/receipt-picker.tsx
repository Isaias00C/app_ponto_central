import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { IoCameraOutline } from 'react-icons/io5';

import { Button } from '@/components/button';

import styles from './receipt-picker.module.css';

type Props = {
  /** Chamada com a foto escolhida, ou `null` ao remover. */
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

type Picked = { file: File; previewUrl: string };

/**
 * Foto do comprovante de pagamento: tira na hora (camera) ou escolhe da galeria. A escolha fica
 * aqui dentro; quem usa so recebe o arquivo e deve zerar o seu proprio estado ao desmontar.
 */
export function ReceiptPicker({ onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Libera a URL temporaria do preview ao trocar de imagem ou sair da tela.
  useEffect(() => {
    if (!picked) return;
    return () => URL.revokeObjectURL(picked.previewUrl);
  }, [picked]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpa o input para poder escolher o mesmo arquivo de novo depois de remover.
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem.');
      return;
    }
    setError(null);
    setPicked({ file, previewUrl: URL.createObjectURL(file) });
    onChange(file);
  }

  function remove() {
    setPicked(null);
    onChange(null);
  }

  function choose() {
    inputRef.current?.click();
  }

  const previewUrl = picked?.previewUrl ?? null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Comprovante de pagamento</span>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFileChange} />

      {previewUrl ? (
        <button
          type="button"
          aria-label="Trocar foto do comprovante"
          onClick={choose}
          disabled={disabled}
          className={styles.previewButton}
        >
          <img src={previewUrl} alt="Comprovante de pagamento" className={styles.preview} />
        </button>
      ) : (
        <button type="button" onClick={choose} disabled={disabled} className={styles.empty}>
          <IoCameraOutline size={28} aria-hidden />
          <span>Tirar foto ou escolher imagem</span>
        </button>
      )}

      {picked ? (
        <div className={styles.actions}>
          <Button label="Trocar" variant="secondary" onClick={choose} disabled={disabled} />
          <Button label="Remover" variant="secondary" onClick={remove} disabled={disabled} />
        </div>
      ) : null}

      {error ? <p className="banner banner-error">{error}</p> : null}
    </div>
  );
}
