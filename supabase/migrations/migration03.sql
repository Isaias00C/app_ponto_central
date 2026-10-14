-- migration03: exige login. Todas as tabelas, funcoes e o upload de imagens passam a aceitar
-- apenas o role `authenticated` (usuario logado); o role `anon` perde todo o acesso.
-- Depende da migration01 e da migration02. Pode ser executada de novo sem erro.
--
-- ANTES de rodar (Supabase > Authentication):
--   1. Users > Add user > Create new user: crie as contas de quem vai usar o app
--      (marque "Auto Confirm User" para nao depender de e-mail de confirmacao).
--   2. Sign In / Providers: desligue "Allow new users to sign up" e confirme que
--      "Allow anonymous sign-ins" esta desligado. Sem isso qualquer pessoa cria uma conta
--      pela API e vira `authenticated`, o que deixaria estas policies sem efeito.
-- Rode ESTA migration so depois, senao ninguem consegue entrar no app.

-- shirt_types
drop policy if exists "shirt_types_select" on public.shirt_types;
create policy "shirt_types_select" on public.shirt_types
  for select to authenticated using (true);

drop policy if exists "shirt_types_insert" on public.shirt_types;
create policy "shirt_types_insert" on public.shirt_types
  for insert to authenticated with check (true);

-- shirt_stock
drop policy if exists "shirt_stock_select" on public.shirt_stock;
create policy "shirt_stock_select" on public.shirt_stock
  for select to authenticated using (true);

drop policy if exists "shirt_stock_insert" on public.shirt_stock;
create policy "shirt_stock_insert" on public.shirt_stock
  for insert to authenticated with check (true);

drop policy if exists "shirt_stock_update" on public.shirt_stock;
create policy "shirt_stock_update" on public.shirt_stock
  for update to authenticated using (true) with check (true);

-- Storage: so usuario logado envia imagem. O bucket continua publico para leitura
-- (a imagem aparece pelo link, sem login).
drop policy if exists "shirt_images_insert" on storage.objects;
create policy "shirt_images_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'shirt-images');

-- Funcoes: por padrao qualquer role pode executar (EXECUTE vai para PUBLIC e para `anon`).
-- Elas ja respeitam o RLS acima, mas tiramos a permissao de chamar tambem.
revoke execute on function public.adjust_stock(uuid, text, integer) from public, anon;
grant execute on function public.adjust_stock(uuid, text, integer) to authenticated;

revoke execute on function public.checkout_stock(jsonb) from public, anon;
grant execute on function public.checkout_stock(jsonb) to authenticated;
