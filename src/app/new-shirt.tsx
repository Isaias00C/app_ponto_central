import { router } from 'expo-router';

import { ShirtForm, type ShirtFormValues } from '@/components/shirt-form';
import { useShirts } from '@/hooks/use-shirts';
import { uploadShirtImage } from '@/lib/shirt-images';
import { createShirt } from '@/lib/shirts';

export default function NewShirtScreen() {
  const { reload } = useShirts();

  async function save({ description, image }: ShirtFormValues) {
    const imageUrl = image ? await uploadShirtImage(image) : null;
    await createShirt({ description, imageUrl });
    await reload();
    router.back();
  }

  return <ShirtForm submitLabel="Salvar camisa" onSubmit={save} />;
}
