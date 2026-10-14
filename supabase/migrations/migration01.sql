-- migration01: estrutura inicial (tabelas shirt_types/shirt_stock, funcao adjust_stock e RLS).
-- JA APLICADA no Supabase. Nao edite e nao rode de novo: as policies abaixo nao tem
-- `drop policy if exists` e falhariam com "policy already exists".
--
-- Schema do app de estoque de camisas.
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.

create table if not exists public.shirt_types (
  id          uuid primary key default gen_random_uuid(),
  description text not null check (char_length(trim(description)) > 0),
  image_url   text,
  created_at  timestamptz not null default now()
);

create table if not exists public.shirt_stock (
  shirt_type_id uuid not null references public.shirt_types (id) on delete cascade,
  size          text not null check (size in ('PP', 'P', 'M', 'G', 'GG', 'XG')),
  quantity      integer not null default 0 check (quantity >= 0),
  updated_at    timestamptz not null default now(),
  primary key (shirt_type_id, size)
);

-- Soma (ou subtrai, se p_delta < 0) do estoque de forma atomica.
-- Cria a linha do tamanho se ela ainda nao existir e falha se o saldo ficaria negativo.
create or replace function public.adjust_stock(
  p_shirt_type_id uuid,
  p_size          text,
  p_delta         integer
)
returns integer
language plpgsql
set search_path = public
as $$
declare
  new_quantity integer;
begin
  insert into public.shirt_stock as s (shirt_type_id, size, quantity)
  values (p_shirt_type_id, p_size, p_delta)
  on conflict (shirt_type_id, size)
  do update set quantity = s.quantity + excluded.quantity, updated_at = now()
  returning s.quantity into new_quantity;

  return new_quantity;
end;
$$;

-- Row Level Security
alter table public.shirt_types enable row level security;
alter table public.shirt_stock enable row level security;

-- ATENCAO: como o app ainda nao tem login, estas policies liberam leitura e escrita
-- para qualquer pessoa com a publishable key (que fica embutida no app).
-- Quando adicionar autenticacao, troque `anon, authenticated` por `authenticated`.
create policy "shirt_types_select" on public.shirt_types
  for select to anon, authenticated using (true);
create policy "shirt_types_insert" on public.shirt_types
  for insert to anon, authenticated with check (true);

create policy "shirt_stock_select" on public.shirt_stock
  for select to anon, authenticated using (true);
create policy "shirt_stock_insert" on public.shirt_stock
  for insert to anon, authenticated with check (true);
create policy "shirt_stock_update" on public.shirt_stock
  for update to anon, authenticated using (true) with check (true);

-- Dados de exemplo (opcional): descomente para ver o app populado.
-- with t as (
--   insert into public.shirt_types (description) values
--     ('Camisa azul lisa na frente e estampada atras'),
--     ('Camisa preta com logo pequeno no peito')
--   returning id, description
-- )
-- insert into public.shirt_stock (shirt_type_id, size, quantity)
-- select t.id, s.size, s.qty
-- from t
-- cross join (values ('P', 8), ('M', 15), ('G', 12), ('GG', 4)) as s (size, qty);
