-- Execute este script no SQL Editor do Supabase (Project > SQL Editor > New query)
-- depois de atualizar o código. Ele faz três coisas:
--   1. Troca o conjunto de status pelo fluxo real do laboratório
--      (Recebido, Standby, CAD, CAM, Finalização, Entregue — sem "Cancelado").
--   2. Adiciona a coluna que guarda o id do cartão do Trello de cada pedido.
--   3. Adiciona a coluna "cor da restauração" (novo campo do formulário).
--
-- É seguro rodar mesmo com pedidos já existentes: os status antigos são
-- mapeados pros novos antes da troca da regra de validação.

-- 1) Mapeia os status antigos pros novos.
update pedidos set status = 'recebido' where status = 'recebido';
update pedidos set status = 'standby' where status in ('em_conferencia', 'arquivos_confirmados', 'aceito');
update pedidos set status = 'cad' where status = 'em_execucao';
update pedidos set status = 'finalizacao' where status = 'concluido';
update pedidos set status = 'entregue' where status = 'entregue';
-- "Cancelado" não existe mais como status. Pedidos que estavam cancelados
-- caem em "standby" — revise-os manualmente depois de rodar esta migração.
update pedidos set status = 'standby' where status = 'cancelado';

-- 2) Troca a regra de validação do status pro novo conjunto.
alter table pedidos drop constraint if exists pedidos_status_check;
alter table pedidos add constraint pedidos_status_check
  check (status in (
    'recebido',
    'standby',
    'cad',
    'cam',
    'finalizacao',
    'entregue'
  ));

-- 3) Coluna nova: id do cartão do Trello vinculado ao pedido (null até o
--    cartão ser criado).
alter table pedidos add column if not exists trello_card_id text;
create index if not exists idx_pedidos_trello_card_id on pedidos(trello_card_id);

-- 4) Coluna nova: cor final da restauração (campo obrigatório no formulário
--    a partir de agora; pedidos antigos ficam com valor nulo).
alter table pedidos add column if not exists cor_restauracao text;
