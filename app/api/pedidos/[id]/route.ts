import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STATUS_ORDER } from "@/lib/types";
import { moverCartaoTrello } from "@/lib/trello";

const COOKIE_NAME = "tatim_admin_session";

function autorizado(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const esperado = process.env.ADMIN_PASSWORD ?? "";
  return Boolean(cookie && esperado && cookie === esperado);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!autorizado(req)) {
    return NextResponse.json({ ok: false, erro: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const atualizacao: Record<string, unknown> = {};

  if (body.status) {
    if (!STATUS_ORDER.includes(body.status)) {
      return NextResponse.json({ ok: false, erro: "Status inválido" }, { status: 400 });
    }
    atualizacao.status = body.status;
    atualizacao.status_updated_at = new Date().toISOString();
  }

  if (typeof body.notas_internas === "string") {
    atualizacao.notas_internas = body.notas_internas;
  }

  if (Object.keys(atualizacao).length === 0) {
    return NextResponse.json({ ok: false, erro: "Nada para atualizar" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .update(atualizacao)
    .eq("id", params.id)
    .select("id, status, trello_card_id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, erro: "Pedido não encontrado (nada foi atualizado)" },
      { status: 404 }
    );
  }

  // Espelha a mudança de status no Trello (se o pedido já tiver um cartão
  // vinculado). Isso não bloqueia a resposta em caso de falha — o status já
  // foi salvo no banco, que é a fonte da verdade.
  if (body.status && data.trello_card_id) {
    moverCartaoTrello(data.trello_card_id, body.status).catch(() => {});
  }

  return NextResponse.json({ ok: true, pedido: data });
}
