import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Pedido } from "@/lib/types";
import { criarCartaoTrello } from "@/lib/trello";

// Chamado pelo formulário público (/novo-pedido) logo depois que o pedido é
// gravado no banco. Cria o cartão correspondente no Trello, na lista
// "Recebidos". Se o Trello não estiver configurado, ou a chamada falhar,
// isso não deve impedir o pedido de existir — só loga o erro.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pedidoId = body?.pedidoId;

  if (!pedidoId || typeof pedidoId !== "string") {
    return NextResponse.json({ ok: false, erro: "pedidoId é obrigatório" }, { status: 400 });
  }

  const { data: pedido, error: erroBusca } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (erroBusca || !pedido) {
    return NextResponse.json({ ok: false, erro: "Pedido não encontrado" }, { status: 404 });
  }

  // Já tem cartão? Não cria de novo (evita duplicar em caso de retry).
  if (pedido.trello_card_id) {
    return NextResponse.json({ ok: true, cardId: pedido.trello_card_id, jaExistia: true });
  }

  const cardId = await criarCartaoTrello(pedido as Pedido);
  if (!cardId) {
    return NextResponse.json({ ok: false, erro: "Não foi possível criar o cartão no Trello" });
  }

  await supabaseAdmin.from("pedidos").update({ trello_card_id: cardId }).eq("id", pedidoId);

  return NextResponse.json({ ok: true, cardId });
}
