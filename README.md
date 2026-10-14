# Ponto Central — estoque de camisas

App React Native (Expo) para Android e iOS. Os dados ficam no Supabase.

## Configuração

1. No [Supabase](https://supabase.com), crie um projeto e rode, **em ordem**, cada arquivo de `supabase/migrations/`
   (`migration01.sql`, `migration02.sql`, …) no **SQL Editor**. Cada migration é rodada uma única vez.
2. Copie `.env.example` para `.env` e preencha com os valores de **Project Settings > API**:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-publishable-key
   ```
3. Instale e rode:
   ```
   npm install
   npx expo start
   ```
   Abra no celular com o app **Expo Go** (QR code), ou pressione `a` (emulador Android) / `i` (simulador iOS, só no macOS).

## Imagens das camisas

Ao cadastrar uma camisa (Gerenciar > Cadastrar nova camisa) você escolhe a imagem direto da galeria do celular.
Ela é enviada para o bucket público `shirt-images` do Supabase Storage (criado pela `supabase/migrations/migration02.sql`) e o
link fica salvo em `shirt_types.image_url`. Sem imagem, o card mostra um ícone.

## Dar baixa (venda)

Abra uma camisa e use **+** nos tamanhos para separar unidades no carrinho. Vá a outras camisas e repita. A barra
**Carrinho** aparece acima da navbar; ao abri-la, confira os itens e toque em **Dar baixa no estoque**. A baixa é
feita de uma vez só (tudo ou nada) pela função `checkout_stock`, que recusa a operação se faltar estoque em algum item.

> Ao atualizar o app, rode no SQL Editor apenas as migrations novas que ainda não foram aplicadas.

## Estrutura

- `src/app` — rotas (Expo Router): abas **Início** e **Gerenciar**, detalhe da camisa, carrinho de baixa e modal de nova camisa
- `src/lib` — cliente Supabase e operações de dados
- `src/components`, `src/hooks`, `src/constants` — UI, estado compartilhado, tema
- `supabase/migrations/` — alterações do banco, uma por arquivo, em ordem:
  - `migration01.sql` — tabelas, função `adjust_stock` e policies de RLS
  - `migration02.sql` — função `checkout_stock` (baixa em lote) e bucket `shirt-images` com a policy de upload
