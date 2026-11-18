import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/button';

import styles from './receipt-picker.module.css';

type Props = {
  /** Chamada com a foto escolhida, ou `null` ao remover. */
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

type Picked = { file: File; previewUrl: string };

/**
 * Foto do comprovante de pagamento: botoes separados para tirar na hora (camera) ou escolher da galeria. A escolha fica
 * aqui dentro; quem usa so recebe o arquivo e deve zerar o seu proprio estado ao desmontar.
 */
export function ReceiptPicker({ onChange, disabled }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
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

  // O navegador do celular so oferece a camera junto da galeria quando quer; com `capture` ela abre
  // direto, e sem ele abre o seletor. Por isso sao dois inputs, um para cada caminho.
  function openCamera() {
    cameraRef.current?.click();
  }

  function openGallery() {
    galleryRef.current?.click();
  }

  const previewUrl = picked?.previewUrl ?? null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Comprovante de pagamento</span>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onFileChange}
      />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFileChange} />

      {previewUrl ? (
        <img src={previewUrl} alt="Comprovante de pagamento" className={styles.preview} />
      ) : null}

      <div className={styles.actions}>
        <Button
          label="Tirar foto"
          variant="secondary"
          onClick={openCamera}
          disabled={disabled}
        />
        <Button label="Galeria" variant="secondary" onClick={openGallery} disabled={disabled} />
        {picked ? (
          <Button label="Remover" variant="secondary" onClick={remove} disabled={disabled} />
        ) : null}
      </div>

      {error ? <p className="banner banner-error">{error}</p> : null}
    </div>
  );
}
