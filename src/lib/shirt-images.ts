import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

const BUCKET = 'shirt-images';

/** Maior lado da imagem enviada pela web (o picker do navegador nao recorta nem comprime). */
const WEB_MAX_DIMENSION = 1280;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

export type PickedImage = {
  uri: string;
  mimeType: string;
};

/** Abre a galeria e devolve a imagem escolhida (recortada em quadrado), ou `null` se cancelar. */
export async function pickShirtImage(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' };
}

type UploadBody = { body: ArrayBuffer | Blob; mimeType: string };

/**
 * Na web `allowsEditing`, `aspect` e `quality` nao tem efeito: uma foto de celular pode passar
 * dos 5 MB do bucket. Reduz e converte para JPEG; se o navegador nao decodificar o formato
 * (ex.: HEIC no Chrome), envia o original.
 */
async function readWebImage(image: PickedImage): Promise<UploadBody> {
  const original = await (await fetch(image.uri)).blob();

  try {
    const bitmap = await createImageBitmap(original);
    const scale = Math.min(1, WEB_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.8),
    );
    if (resized) return { body: resized, mimeType: 'image/jpeg' };
  } catch {
    // Formato nao suportado pelo navegador: cai no original abaixo.
  }

  return { body: original, mimeType: original.type || image.mimeType };
}

async function readNativeImage(image: PickedImage): Promise<UploadBody> {
  // Carregado so no nativo: o expo-file-system nao lista suporte a web.
  const { File } = await import('expo-file-system');
  // No React Native o storage-js so aceita ArrayBuffer (Blob/File/FormData nao funcionam).
  return { body: await new File(image.uri).arrayBuffer(), mimeType: image.mimeType };
}

/** Envia a imagem para o Storage do Supabase e devolve a URL publica. */
export async function uploadShirtImage(image: PickedImage): Promise<string> {
  const { body, mimeType } =
    Platform.OS === 'web' ? await readWebImage(image) : await readNativeImage(image);

  const extension = EXTENSIONS[mimeType] ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: mimeType,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
