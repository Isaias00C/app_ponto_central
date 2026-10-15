import { Page } from '@/components/page';
import { ShirtCard } from '@/components/shirt-card';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { useShirts } from '@/hooks/use-shirts';

import styles from './home-page.module.css';

export function HomePage() {
  return (
    <Page title="Camisas" logo>
      <ShirtList />
    </Page>
  );
}

function ShirtList() {
  const { shirts, error, reload } = useShirts();

  if (!shirts) {
    return error ? <ErrorView message={error} onRetry={reload} /> : <LoadingView />;
  }

  if (shirts.length === 0) {
    return (
      <EmptyView
        title="Nenhuma camisa cadastrada"
        message="Vá em Gerenciar para cadastrar a primeira camisa."
      />
    );
  }

  return (
    <div className={styles.content}>
      {error ? <p className="banner banner-error">Não foi possível atualizar: {error}</p> : null}
      {shirts.map((shirt) => (
        <ShirtCard key={shirt.id} shirt={shirt} />
      ))}
    </div>
  );
}
