import { supabase } from '@/lib/supabase';

const BUCKET = 'shirt-images';

/** Maior lado da imagem enviada (o seletor de arquivos do navegador nao recorta nem comprime). */
const MAX_DIMENSION = 1280;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/**
 * Uma foto de celular pode passar dos 5 MB do bucket: reduz e converte para JPEG. Se o navegador
 * nao decodificar o formato (ex.: HEIC no Chrome), envia o original.
 */
async function resizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.8),
    );
    if (resized) return resized;
  } catch {
    // Formato nao suportado pelo navegador: cai no original abaixo.
  }

  return file;
}

/** Envia a imagem para o Storage do Supabase e devolve a URL publica. */
export async function uploadShirtImage(file: File): Promise<string> {
  const body = await resizeImage(file);
  const mimeType = body.type || 'image/jpeg';

  const extension = EXTENSIONS[mimeType] ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: mimeType,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Apaga do Storage a imagem de uma URL publica do bucket. Best-effort: se falhar, so sobra um
 * arquivo orfao, o que nao deve impedir a edicao/exclusao da camisa.
 */
export async function deleteShirtImage(url: string | null): Promise<void> {
  if (!url) return;

  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Ignorado de proposito (ver acima).
  }
}
