-- migration04: editar e excluir tipos de camisa (policies de UPDATE/DELETE em shirt_types) e
-- permitir remover do Storage a imagem antiga (policies de SELECT/DELETE no bucket shirt-images).
-- Depende da migration01, migration02 e migration03. Pode ser executada de novo sem erro.
--
-- Excluir uma camisa apaga tambem o estoque dela: shirt_stock tem `on delete cascade`
-- (migration01), e essa remocao em cascata nao passa pelo RLS.

-- shirt_types: so usuario logado altera e exclui.
drop policy if exists "shirt_types_update" on public.shirt_types;
create policy "shirt_types_update" on public.shirt_types
  for update to authenticated using (true) with check (true);

drop policy if exists "shirt_types_delete" on public.shirt_types;
create policy "shirt_types_delete" on public.shirt_types
  for delete to authenticated using (true);

-- Storage: o app apaga a imagem antiga quando ela e trocada/removida ou a camisa e excluida.
-- A remocao precisa de DELETE e tambem de SELECT (o Storage le a linha ao apagar).
drop policy if exists "shirt_images_select" on storage.objects;
create policy "shirt_images_select" on storage.objects
  for select to authenticated using (bucket_id = 'shirt-images');

drop policy if exists "shirt_images_delete" on storage.objects;
create policy "shirt_images_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'shirt-images');
