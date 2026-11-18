type ResizeOptions = {
  /** Maior lado da imagem resultante, em pixels. */
  maxDimension: number;
  /** Qualidade JPEG, de 0 a 1. */
  quality: number;
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/**
 * O seletor de arquivos do navegador nao recorta nem comprime, e uma foto de celular passa
 * facilmente de 5 MB: reduz e converte para JPEG. Se o navegador nao decodificar o formato
 * (ex.: HEIC no Chrome), devolve o original.
 */
export async function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  try {
    // `imageOrientation` aplica a rotacao EXIF: foto de celular em pe nao pode sair deitada.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, options.maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (context) {
      // PNG com transparencia viraria preto ao converter para JPEG.
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }
    bitmap.close();

    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', options.quality),
    );
    if (resized) return resized;
  } catch {
    // Formato nao suportado pelo navegador: cai no original abaixo.
  }

  return file;
}

/** Nome unico para o arquivo no bucket, com a extensao do tipo da imagem. */
export function uniqueImagePath(mimeType: string): string {
  const extension = EXTENSIONS[mimeType] ?? 'jpg';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}
