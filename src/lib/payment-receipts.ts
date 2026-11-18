import { resizeImage, uniqueImagePath } from '@/lib/image-resize';
import { supabase } from '@/lib/supabase';

const BUCKET = 'payment-receipts';

/** Por quanto tempo o link de visualizacao vale. */
const SIGNED_URL_SECONDS = 60 * 60;

/**
 * Envia o comprovante para o bucket privado e devolve o caminho do arquivo (nao uma URL).
 * Lado maior de 1600 px e qualidade 0.7: o texto do comprovante continua legivel e a foto
 * costuma ficar em poucas centenas de KB.
 */
export async function uploadPaymentReceipt(file: File): Promise<string> {
  const body = await resizeImage(file, { maxDimension: 1600, quality: 0.7 });
  const mimeType = body.type || 'image/jpeg';
  const path = uniqueImagePath(mimeType);

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: mimeType,
  });
  if (error) throw error;

  return path;
}

/** Apaga o arquivo. Best-effort: se falhar, so sobra um arquivo orfao no bucket. */
export async function deletePaymentReceipt(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Ignorado de proposito (ver acima).
  }
}

/** Link temporario para ver o comprovante (o bucket e privado). */
export async function getPaymentReceiptUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}
