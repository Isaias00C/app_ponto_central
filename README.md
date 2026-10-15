# Ponto Central — estoque de camisas

PWA (React + Vite + TypeScript) publicado no GitHub Pages. Os dados e o login ficam no Supabase.

Endereço: `https://<seu-usuario>.github.io/app_ponto_central/`

## Configuração

### 1. Supabase

1. Crie um projeto no [Supabase](https://supabase.com) e rode, **em ordem**, cada arquivo de `supabase/migrations/`
   (`migration01.sql`, `migration02.sql`, …) no **SQL Editor**. Cada migration é rodada uma única vez.
2. **Antes da `migration03.sql`**, em **Authentication**:
   - **Users > Add user > Create new user**: crie a conta de cada pessoa que vai usar (marque *Auto Confirm User*).
   - **Sign In / Providers**: desligue **Allow new users to sign up** e confirme que **Allow anonymous sign-ins**
     está desligado. Sem isso qualquer pessoa cria uma conta pela API e passa pelo login.
3. Agora rode a `migration03.sql`. Ela tira todo o acesso do role `anon`: só usuário logado lê e escreve.

### 2. Rodar localmente

1. Copie `.env.example` para `.env` e preencha com os valores de **Project Settings > API**:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sua-publishable-key
   ```
2. Instale e rode:
   ```
   npm install
   npm run dev
   ```
   Abra `http://localhost:5173/app_ponto_central/`. Para testar o build de produção: `npm run build` e
   `npm run preview`.

### 3. Publicar no GitHub Pages

O deploy é feito pelo GitHub Actions (`.github/workflows/deploy-pages.yml`) a cada push na `main`.

1. No repositório: **Settings > Pages > Source: GitHub Actions**.
2. **Settings > Secrets and variables > Actions > Variables**: crie `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_PUBLISHABLE_KEY` (os mesmos valores do `.env`; são públicos, ficam embutidos no site).
3. Faça push na `main` (ou rode o workflow manualmente em **Actions**).

O subcaminho `/app_ponto_central/` vem do `base` no `vite.config.ts`. Se renomear o repositório, troque lá.

## Usar no celular

Abra o endereço no navegador e entre com e-mail e senha. Para instalar como app:
- **Android (Chrome):** menu ⋮ > *Instalar app* / *Adicionar à tela inicial*.
- **iPhone (Safari):** Compartilhar > *Adicionar à Tela de Início*.

Não há *pull to refresh*: o estoque recarrega ao voltar para a aba/app e ao reabrir.

## Imagens das camisas

Ao cadastrar uma camisa (Gerenciar > Cadastrar nova camisa) você escolhe a imagem da galeria/arquivos.
A imagem é reduzida (lado maior de 1280 px, JPEG) antes do envio, para caber nos 5 MB do bucket.
Ela é enviada para o bucket público `shirt-images` do Supabase Storage (criado pela `migration02.sql`) e o
link fica salvo em `shirt_types.image_url`. Sem imagem, o card mostra um ícone.

Para **editar** (descrição e imagem) ou **excluir** uma camisa, selecione-a em Gerenciar > Camisa e use os botões
**Editar** / **Excluir**. Excluir apaga também o estoque dela e a imagem no bucket (exige a `migration04.sql`).

## Dar baixa (venda)

Abra uma camisa e use **+** nos tamanhos para separar unidades no carrinho. Vá a outras camisas e repita. A barra
**Carrinho** aparece acima da navbar; ao abri-la, confira os itens e toque em **Dar baixa no estoque**. A baixa é
feita de uma vez só (tudo ou nada) pela função `checkout_stock`, que recusa a operação se faltar estoque em algum item.

## Segurança

- O app é estático e a *publishable key* vai no site; **quem protege os dados é o RLS** do Supabase, não o login do app.
  Por isso as policies (`migration03.sql`) só aceitam o role `authenticated`.
- Contas são criadas manualmente no painel (cadastro público desligado).
- As imagens ficam em bucket público: quem tiver o link de uma imagem consegue vê-la sem login.

## Estrutura

- `src/App.tsx` — rotas (React Router) e guardas de login
- `src/pages` — telas: login, abas **Início** e **Gerenciar**, detalhe da camisa, carrinho, nova/editar camisa
- `src/lib` — cliente Supabase e operações de dados
- `src/components`, `src/hooks`, `src/constants` — UI (CSS Modules), estado compartilhado (sessão, estoque, carrinho), tamanhos
- `src/index.css` — tema (cores, espaçamentos) em variáveis CSS
- `index.html`, `public/` — página e arquivos estáticos do PWA (`manifest.json`, ícones)
- `supabase/migrations/` — alterações do banco, uma por arquivo, em ordem:
  - `migration01.sql` — tabelas, função `adjust_stock` e policies de RLS
  - `migration02.sql` — função `checkout_stock` (baixa em lote) e bucket `shirt-images` com a policy de upload
  - `migration03.sql` — exige login: policies e funções só para `authenticated`
  - `migration04.sql` — editar e excluir camisas: policies de update/delete em `shirt_types` e de remoção de imagens no bucket
