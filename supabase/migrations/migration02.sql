-- migration02: baixa em lote (funcao checkout_stock) e imagens das camisas (bucket shirt-images).
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.
-- Depende da migration01. Pode ser executada de novo sem erro.

-- Da baixa em varios itens de uma vez (carrinho de saida).
-- p_items: [{"shirt_type_id": "<uuid>", "size": "M", "quantity": 2}, ...]
-- Tudo ou nada: se qualquer item nao tiver estoque suficiente, nenhuma baixa e feita.
create or replace function public.checkout_stock(p_items jsonb)
returns void
language plpgsql
set search_path = public
as $$
declare
  item        jsonb;
  v_shirt_id  uuid;
  v_size      text;
  v_quantity  integer;
  v_desc      text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Nenhum item para dar baixa.';
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    v_shirt_id := (item ->> 'shirt_type_id')::uuid;
    v_size     := item ->> 'size';
    v_quantity := (item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Quantidade invalida.';
    end if;

    update public.shirt_stock
       set quantity = quantity - v_quantity, updated_at = now()
     where shirt_type_id = v_shirt_id
       and size = v_size
       and quantity >= v_quantity;

    if not found then
      select description into v_desc from public.shirt_types where id = v_shirt_id;
      raise exception 'Estoque insuficiente: % (tamanho %).', coalesce(v_desc, 'camisa removida'), v_size;
    end if;
  end loop;
end;
$$;

-- Storage: bucket publico para as imagens das camisas (limite de 5 MB por arquivo).
-- Bucket publico nao precisa de policy de leitura; so de INSERT para o upload pelo app.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shirt-images',
  'shirt-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "shirt_images_insert" on storage.objects;
create policy "shirt_images_insert" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'shirt-images');
