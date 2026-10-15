import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { Button } from '@/components/button';
import { ShirtImage } from '@/components/shirt-image';
import { errorMessage } from '@/lib/shirts';

import styles from './shirt-form.module.css';

export type ShirtFormValues = {
  description: string;
  /** Imagem nova escolhida, se houver. */
  image: File | null;
  /** A imagem que ja existia foi removida (e nenhuma nova foi escolhida). */
  removeImage: boolean;
};

type Props = {
  initialDescription?: string;
  initialImageUrl?: string | null;
  submitLabel: string;
  /** Quem chama navega ao terminar; se lancar, a mensagem aparece no formulario. */
  onSubmit: (values: ShirtFormValues) => Promise<void>;
};

type PickedImage = { file: File; previewUrl: string };

export function ShirtForm({
  initialDescription = '',
  initialImageUrl = null,
  submitLabel,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedDescription = description.trim();
  const canSubmit = trimmedDescription.length > 0;
  const previewUri = image?.previewUrl ?? (removeImage ? null : initialImageUrl);

  // Libera a URL temporaria do preview ao trocar de imagem ou sair da tela.
  useEffect(() => {
    if (!image) return;
    return () => URL.revokeObjectURL(image.previewUrl);
  }, [image]);

  function chooseImage() {
    setError(null);
    fileInputRef.current?.click();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpa o input para poder escolher o mesmo arquivo de novo depois de remover.
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem.');
      return;
    }
    setImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function clearImage() {
    setImage(null);
    setRemoveImage(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        description: trimmedDescription,
        image: image?.file ?? null,
        removeImage: removeImage && image === null,
      });
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  }

  return (
    <form className={styles.content} onSubmit={submit}>
      <label className={styles.field}>
        <span className={styles.label}>Descrição</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: Camisa azul lisa na frente e estampada atrás"
          rows={4}
          className={styles.input}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Imagem (opcional)</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onFileChange}
        />
        <button
          type="button"
          aria-label={previewUri ? 'Trocar imagem' : 'Escolher imagem'}
          onClick={chooseImage}
          disabled={saving}
          className={styles.previewButton}
        >
          <ShirtImage uri={previewUri} className={styles.preview} />
        </button>
        <div className={styles.imageActions}>
          <Button
            label={previewUri ? 'Trocar imagem' : 'Escolher imagem'}
            variant="secondary"
            onClick={chooseImage}
            disabled={saving}
          />
          {previewUri ? (
            <Button label="Remover" variant="secondary" onClick={clearImage} disabled={saving} />
          ) : null}
        </div>
      </div>

      {error ? <p className="banner banner-error">{error}</p> : null}

      <Button type="submit" label={submitLabel} disabled={!canSubmit} loading={saving} />
    </form>
  );
}
