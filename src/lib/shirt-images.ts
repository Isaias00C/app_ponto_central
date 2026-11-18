import { resizeImage, uniqueImagePath } from '@/lib/image-resize';
import { supabase } from '@/lib/supabase';

const BUCKET = 'shirt-images';

/** Envia a imagem para o Storage do Supabase e devolve a URL publica. */
export async function uploadShirtImage(file: File): Promise<string> {
  const body = await resizeImage(file, { maxDimension: 1280, quality: 0.8 });
  const mimeType = body.type || 'image/jpeg';

  const path = uniqueImagePath(mimeType);

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
