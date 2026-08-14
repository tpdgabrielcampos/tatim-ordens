import { Pedido, StatusPedido } from "@/lib/types";

const TRELLO_API_KEY = process.env.TRELLO_API_KEY ?? "";
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN ?? "";

// Mapa status -> id da lista no Trello. Cada valor vem de uma variável de
// ambiente diferente (configuradas na Vercel) porque os ids das listas são
// específicos do board "GC" do laboratório.
const STATUS_TO_LIST: Record<StatusPedido, string | undefined> = {
  recebido: process.env.TRELLO_LIST_RECEBIDO,
  standby: process.env.TRELLO_LIST_STANDBY,
  cad: process.env.TRELLO_LIST_CAD,
  cam: process.env.TRELLO_LIST_CAM,
  finalizacao: process.env.TRELLO_LIST_FINALIZACAO,
  entregue: process.env.TRELLO_LIST_ENTREGUE,
};

function trelloConfigurado() {
  return Boolean(TRELLO_API_KEY && TRELLO_API_TOKEN);
}

function authParams() {
  return `key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`;
}

/** Id da lista do Trello correspondente a um status. */
export function listIdParaStatus(status: StatusPedido): string | undefined {
  return STATUS_TO_LIST[status];
}

/** Status correspondente a um id de lista do Trello (busca reversa). */
export function statusParaListId(listId: string): StatusPedido | undefined {
  const entrada = (Object.entries(STATUS_TO_LIST) as [StatusPedido, string | undefined][]).find(
    ([, id]) => id === listId
  );
  return entrada?.[0];
}

function descricaoCartao(pedido: Pedido) {
  const linhas = [
    `Dentista: ${pedido.dentista_nome}`,
    `Trabalho: ${pedido.tipo_trabalho}`,
    pedido.dentes?.length ? `Dentes: ${pedido.dentes.join(", ")}` : null,
    pedido.material ? `Material: ${pedido.material}` : null,
    pedido.prazo_desejado ? `Prazo desejado: ${pedido.prazo_desejado}` : null,
    pedido.dscore_referencia ? `Referência DS Core: ${pedido.dscore_referencia}` : null,
    pedido.observacoes ? `Observações: ${pedido.observacoes}` : null,
    "",
    `Ver no painel: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/pedido/${pedido.id}`,
  ].filter(Boolean);
  return linhas.join("\n");
}

/**
 * Cria um cartão no Trello para um pedido novo, na lista correspondente ao
 * status atual dele (normalmente "recebido"). Retorna o id do cartão criado,
 * ou null se o Trello não estiver configurado ou a chamada falhar — nesse
 * caso o pedido continua existindo normalmente, só sem o cartão.
 */
export async function criarCartaoTrello(pedido: Pedido): Promise<string | null> {
  if (!trelloConfigurado()) return null;
  const listId = listIdParaStatus(pedido.status);
  if (!listId) return null;

  try {
    const params = new URLSearchParams({
      idList: listId,
      name: `${pedido.paciente_nome} — ${pedido.tipo_trabalho}`,
      desc: descricaoCartao(pedido),
    });
    const res = await fetch(`https://api.trello.com/1/cards?${authParams()}&${params}`, {
      method: "POST",
    });
    if (!res.ok) {
      console.error("Falha ao criar cartão no Trello:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.id as string;
  } catch (err) {
    console.error("Erro ao criar cartão no Trello:", err);
    return null;
  }
}

/**
 * Move um cartão existente para a lista correspondente a um novo status.
 * Não lança erro se falhar — a atualização do status no banco já aconteceu
 * antes dessa chamada, e o Trello é só um espelho.
 */
export async function moverCartaoTrello(cardId: string, status: StatusPedido): Promise<boolean> {  if (!trelloConfigurado()) return false;
  const listId = listIdParaStatus(status);
  if (!listId) return false;

  try {
    const res = await fetch(
      `https://api.trello.com/1/cards/${cardId}?idList=${listId}&${authParams()}`,
      { method: "PUT" }
    );
    if (!res.ok) {
      console.error("Falha ao mover cartão no Trello:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erro ao mover cartão no Trello:", err);
    return false;
  }
}
