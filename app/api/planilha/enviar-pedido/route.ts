import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Pedido } from "@/lib/types";
import { enviarParaPlanilha } from "@/lib/planilha";

// Chamado pelo formulário público (/novo-pedido) logo depois que o pedido (e
// as fotos) são gravados. Acrescenta uma linha na planilha Google. Se a
// planilha não estiver configurada, ou a chamada falhar, o pedido continua
// salvo normalmente — aqui só registramos o erro (visível nos Logs da Vercel).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pedidoId = body?.pedidoId;

  if (!pedidoId || typeof pedidoId !== "string") {
    return NextResponse.json({ ok: false, erro: "pedidoId é obrigatório" }, { status: 400 });
  }

  const { data: pedido, error } = await supabaseAdmin
    .from("pedidos")
    .select("*, pedido_fotos(*)")
    .eq("id", pedidoId)
    .single();

  if (error || !pedido) {
    return NextResponse.json({ ok: false, erro: "Pedido não encontrado" }, { status: 404 });
  }

  const resultado = await enviarParaPlanilha([pedido as Pedido]);
  if (!resultado.ok) {
    console.error(`[planilha] Falha ao enviar o pedido ${pedidoId}: ${resultado.erro}`);
  }
  return NextResponse.json(resultado);
}
