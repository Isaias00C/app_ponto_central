import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

const BUCKET = 'shirt-images';

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

/** Envia a imagem para o Storage do Supabase e devolve a URL publica. */
export async function uploadShirtImage(image: PickedImage): Promise<string> {
  const extension = EXTENSIONS[image.mimeType] ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  // No React Native o storage-js so aceita ArrayBuffer (Blob/File/FormData nao funcionam).
  const body = await new File(image.uri).arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: image.mimeType,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
