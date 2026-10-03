-- Execute este script no SQL Editor do Supabase (Project > SQL Editor > New query)
-- ANTES de publicar a nova versão do site. Ele só acrescenta duas colunas;
-- os pedidos já existentes ficam com elas vazias.

alter table pedidos add column if not exists quem_preencheu text;
alter table pedidos add column if not exists instalacao_agendada date;
