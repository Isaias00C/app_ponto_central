-- migration05: registro de transacoes. Cada baixa de estoque feita pelo carrinho passa a gravar uma
-- transacao (tabela `transacoes`) com os itens vendidos (tabela `transacao_itens`).
-- Depende da migration01, migration02, migration03 e migration04. Pode ser executada de novo sem erro.
--
-- O historico e somente leitura para o app: so existem policies de SELECT e INSERT, entao ninguem
-- edita nem apaga transacoes pela API. Baixas feitas antes desta migration nao tem registro.
-- Excluir uma camisa nao apaga o historico: shirt_type_id vira null e `descricao` guarda o nome
-- que a camisa tinha na hora da baixa.

create table if not exists public.transacoes (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table if not exists public.transacao_itens (
  id            uuid primary key default gen_random_uuid(),
  transacao_id  uuid not null references public.transacoes (id) on delete cascade,
  shirt_type_id uuid references public.shirt_types (id) on delete set null,
  descricao     text not null,
  size          text not null check (size in ('PP', 'P', 'M', 'G', 'GG', 'XG')),
  quantity      integer not null check (quantity > 0)
);

create index if not exists transacoes_created_at_idx on public.transacoes (created_at desc);
create index if not exists transacao_itens_transacao_id_idx on public.transacao_itens (transacao_id);

-- RLS: so usuario logado le e registra.
alter table public.transacoes enable row level security;
alter table public.transacao_itens enable row level security;

drop policy if exists "transacoes_select" on public.transacoes;
create policy "transacoes_select" on public.transacoes
  for select to authenticated using (true);

drop policy if exists "transacoes_insert" on public.transacoes;
create policy "transacoes_insert" on public.transacoes
  for insert to authenticated with check (true);

drop policy if exists "transacao_itens_select" on public.transacao_itens;
create policy "transacao_itens_select" on public.transacao_itens
  for select to authenticated using (true);

drop policy if exists "transacao_itens_insert" on public.transacao_itens;
create policy "transacao_itens_insert" on public.transacao_itens
  for insert to authenticated with check (true);

-- Mesma funcao da migration02 (mesma assinatura), agora registrando a transacao.
-- Tudo ou nada: se faltar estoque, a excecao desfaz tambem o registro.
create or replace function public.checkout_stock(p_items jsonb)
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

  insert into public.transacoes default values returning id into v_transacao_id;

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

-- `create or replace` mantem as permissoes da migration03; reafirmamos por seguranca.
revoke execute on function public.checkout_stock(jsonb) from public, anon;
grant execute on function public.checkout_stock(jsonb) to authenticated;
