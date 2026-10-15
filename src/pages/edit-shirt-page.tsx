import { useParams } from 'react-router';

import { Page } from '@/components/page';
import { ShirtForm, type ShirtFormValues } from '@/components/shirt-form';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { useGoBack } from '@/hooks/use-go-back';
import { useShirts } from '@/hooks/use-shirts';
import { deleteShirtImage, uploadShirtImage } from '@/lib/shirt-images';
import { updateShirt } from '@/lib/shirts';

export function EditShirtPage() {
  return (
    <Page title="Editar camisa" backTo="/manage" modal>
      <EditShirt />
    </Page>
  );
}

function EditShirt() {
  const { id } = useParams<{ id: string }>();
  const { shirts, error, reload } = useShirts();
  const goBack = useGoBack('/manage');

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  const shirt = shirts.find((item) => item.id === id);
  if (!shirt) return <EmptyView title="Camisa não encontrada" />;

  const { id: shirtId, imageUrl: currentImageUrl } = shirt;

  async function save({ description, image, removeImage }: ShirtFormValues) {
    const uploadedUrl = image ? await uploadShirtImage(image) : null;
    const imageUrl = uploadedUrl ?? (removeImage ? null : currentImageUrl);

    try {
      await updateShirt(shirtId, { description, imageUrl });
    } catch (e) {
      // A camisa nao mudou, entao a imagem que acabou de subir ficaria orfa.
      await deleteShirtImage(uploadedUrl);
      throw e;
    }

    // So apaga a antiga depois de salvar: se algo falhar, a camisa continua com a imagem dela.
    if (imageUrl !== currentImageUrl) await deleteShirtImage(currentImageUrl);

    await reload();
    goBack();
  }

  return (
    <ShirtForm
      initialDescription={shirt.description}
      initialImageUrl={shirt.imageUrl}
      submitLabel="Salvar alterações"
      onSubmit={save}
    />
  );
}
