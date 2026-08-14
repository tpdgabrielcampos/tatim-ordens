import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { statusParaListId } from "@/lib/trello";

// O Trello faz uma requisição HEAD (e às vezes GET) pra essa URL na hora de
// criar o webhook, só pra confirmar que ela existe e responde 200.
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

function assinaturaValida(corpoBruto: string, assinaturaRecebida: string | null) {
  const segredo = process.env.TRELLO_API_SECRET;
  const callbackUrl = process.env.TRELLO_WEBHOOK_URL;

  // Se o segredo/URL não estiverem configurados, não dá pra verificar —
  // melhor recusar do que aceitar qualquer coisa sem checagem.
  if (!segredo || !callbackUrl || !assinaturaRecebida) return false;

  const esperada = crypto
    .createHmac("sha1", segredo)
    .update(corpoBruto + callbackUrl)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(esperada), Buffer.from(assinaturaRecebida));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const corpoBruto = await req.text();
  const assinatura = req.headers.get("x-trello-webhook");

  if (!assinaturaValida(corpoBruto, assinatura)) {
    return NextResponse.json({ ok: false, erro: "Assinatura inválida" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(corpoBruto);
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const action = payload?.action;

  // Só nos interessa quando um cartão muda de lista.
  if (action?.type !== "updateCard" || !action?.data?.listAfter) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const cardId: string | undefined = action.data.card?.id;
  const novaListaId: string | undefined = action.data.listAfter?.id;
  if (!cardId || !novaListaId) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const novoStatus = statusParaListId(novaListaId);
  if (!novoStatus) {
    // Cartão foi movido pra uma lista que não corresponde a nenhum status
    // conhecido (ex: uma lista extra criada manualmente no board). Ignora.
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const { data: pedido, error: erroBusca } = await supabaseAdmin
    .from("pedidos")
    .select("id, status")
    .eq("trello_card_id", cardId)
    .maybeSingle();

  if (erroBusca || !pedido) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  if (pedido.status === novoStatus) {
    return NextResponse.json({ ok: true, semMudanca: true });
  }

  const { error: erroUpdate } = await supabaseAdmin
    .from("pedidos")
    .update({ status: novoStatus, status_updated_at: new Date().toISOString() })
    .eq("id", pedido.id);

  if (erroUpdate) {
    return NextResponse.json({ ok: false, erro: erroUpdate.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
