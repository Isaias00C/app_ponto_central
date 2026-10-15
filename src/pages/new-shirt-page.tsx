import { Page } from '@/components/page';
import { ShirtForm, type ShirtFormValues } from '@/components/shirt-form';
import { useGoBack } from '@/hooks/use-go-back';
import { useShirts } from '@/hooks/use-shirts';
import { uploadShirtImage } from '@/lib/shirt-images';
import { createShirt } from '@/lib/shirts';

export function NewShirtPage() {
  const { reload } = useShirts();
  const goBack = useGoBack('/manage');

  async function save({ description, image }: ShirtFormValues) {
    const imageUrl = image ? await uploadShirtImage(image) : null;
    await createShirt({ description, imageUrl });
    await reload();
    goBack();
  }

  return (
    <Page title="Nova camisa" backTo="/manage" modal>
      <ShirtForm submitLabel="Salvar camisa" onSubmit={save} />
    </Page>
  );
}
