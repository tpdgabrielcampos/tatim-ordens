-- Execute este script inteiro no SQL Editor do Supabase (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status_updated_at timestamptz not null default now(),

  -- dados do paciente
  paciente_nome text not null,
  paciente_nascimento date,

  -- dados do dentista / clinica que esta pedindo
  dentista_nome text not null,
  clinica text,
  contato text,

  -- dados do trabalho
  tipo_trabalho text not null,
  dentes text[] not null default '{}',
  material text,
  prazo_desejado date,
  observacoes text,

  -- referencia ao caso no DS Core (preenchido manualmente pelo dentista)
  dscore_referencia text,

  -- controle interno do laboratorio
  status text not null default 'recebido'
    check (status in (
      'recebido',
      'standby',
      'cad',
      'cam',
      'finalizacao',
      'entregue',
      'cancelado'
    )),
  notas_internas text,

  -- id do cartao correspondente no Trello (preenchido automaticamente
  -- quando o pedido chega, se a integracao estiver configurada)
  trello_card_id text
);

create index if not exists idx_pedidos_trello_card_id on pedidos(trello_card_id);

create table if not exists pedido_fotos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pedido_fotos_pedido_id on pedido_fotos(pedido_id);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_pedidos_created_at on pedidos(created_at desc);

-- Row Level Security
alter table pedidos enable row level security;
alter table pedido_fotos enable row level security;

-- Qualquer pessoa com o link do formulario publico pode CRIAR um pedido (insert),
-- mas nao pode ler, editar ou apagar pedidos existentes por essa via.
-- A leitura/edicao completa (dashboard) usa a service role key, que ignora RLS.
drop policy if exists "publico pode criar pedidos" on pedidos;
create policy "publico pode criar pedidos"
  on pedidos for insert
  to anon
  with check (true);

drop policy if exists "publico pode anexar fotos" on pedido_fotos;
create policy "publico pode anexar fotos"
  on pedido_fotos for insert
  to anon
  with check (true);

-- Bucket de storage para as fotos dos pedidos.
-- Rode isso tambem (ou crie o bucket "pedido-fotos" manualmente em Storage > New bucket, marcado como Public).
insert into storage.buckets (id, name, public)
values ('pedido-fotos', 'pedido-fotos', true)
on conflict (id) do nothing;

drop policy if exists "qualquer um pode enviar fotos" on storage.objects;
create policy "qualquer um pode enviar fotos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'pedido-fotos');

drop policy if exists "fotos sao publicas para leitura" on storage.objects;
create policy "fotos sao publicas para leitura"
  on storage.objects for select
  to public
  using (bucket_id = 'pedido-fotos');
