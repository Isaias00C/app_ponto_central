-- migration06: comprovante de pagamento em cada venda. A foto fica no Storage (bucket privado
-- `payment-receipts`) e o caminho do arquivo e gravado em `transacoes.receipt_path`.
-- Depende da migration01 ate migration05. Pode ser executada de novo sem erro.
--
-- O bucket e PRIVADO (comprovante tem dado financeiro): o app le a imagem por link assinado
-- temporario, que so usuario logado consegue gerar. Limite de 5 MB por arquivo; o app ja envia a
-- imagem reduzida.

alter table public.transacoes add column if not exists receipt_path text;

-- Storage: bucket privado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts',
  'payment-receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Somente `authenticated`. SELECT e necessario para gerar o link assinado; DELETE existe para o app
-- limpar o arquivo quando a baixa falha depois do upload.
drop policy if exists "payment_receipts_insert" on storage.objects;
create policy "payment_receipts_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'payment-receipts');

drop policy if exists "payment_receipts_select" on storage.objects;
create policy "payment_receipts_select" on storage.objects
  for select to authenticated using (bucket_id = 'payment-receipts');

drop policy if exists "payment_receipts_delete" on storage.objects;
create policy "payment_receipts_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'payment-receipts');

-- checkout_stock ganha o parametro p_receipt_path. Mudar a assinatura criaria uma segunda funcao
-- (overload) e o PostgREST nao saberia qual chamar, entao a antiga e removida antes.
drop function if exists public.checkout_stock(jsonb);

create or replace function public.checkout_stock(p_items jsonb, p_receipt_path text default null)
returns void
language plpgsql
set search_path = public
as $$
declare
  item            jsonb;
  v_shirt_id      uuid;
  v_size          text;
  v_quantity      integer;
  v_desc          text;
  v_transacao_id  uuid;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Nenhum item para dar baixa.';
  end if;

  insert into public.transacoes (receipt_path)
  values (nullif(trim(p_receipt_path), ''))
  returning id into v_transacao_id;

  for item in select * from jsonb_array_elements(p_items) loop
    v_shirt_id := (item ->> 'shirt_type_id')::uuid;
    v_size     := item ->> 'size';
    v_quantity := (item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Quantidade invalida.';
    end if;

    select description into v_desc from public.shirt_types where id = v_shirt_id;

    update public.shirt_stock
       set quantity = quantity - v_quantity, updated_at = now()
     where shirt_type_id = v_shirt_id
       and size = v_size
       and quantity >= v_quantity;

    if not found then
      raise exception 'Estoque insuficiente: % (tamanho %).', coalesce(v_desc, 'camisa removida'), v_size;
    end if;

    insert into public.transacao_itens (transacao_id, shirt_type_id, descricao, size, quantity)
    values (v_transacao_id, v_shirt_id, v_desc, v_size, v_quantity);
  end loop;
end;
$$;

-- Funcao nova: reaplica as permissoes da migration03 (so `authenticated` executa).
revoke execute on function public.checkout_stock(jsonb, text) from public, anon;
grant execute on function public.checkout_stock(jsonb, text) to authenticated;
