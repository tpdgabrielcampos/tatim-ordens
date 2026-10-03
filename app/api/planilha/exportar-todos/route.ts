import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Pedido } from "@/lib/types";
import { enviarParaPlanilha } from "@/lib/planilha";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const COOKIE_NAME = "tatim_admin_session";

// Exportação única dos pedidos já existentes para a planilha Google. Abra
// /api/planilha/exportar-todos no navegador, já logado no /dashboard.
// Pode ser aberta mais de uma vez sem duplicar: o Apps Script ignora pedidos
// cujo id já está na planilha.
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const esperado = process.env.ADMIN_PASSWORD ?? "";
  if (!cookie || !esperado || cookie !== esperado) {
    return NextResponse.json(
      { ok: false, erro: "Não autorizado — entre no /dashboard primeiro." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("*, pedido_fotos(*)")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  const pedidos = (data ?? []) as Pedido[];
  const resultado = await enviarParaPlanilha(pedidos, 50000);
  if (!resultado.ok) console.error(`[planilha] Falha na exportação: ${resultado.erro}`);

  return NextResponse.json({ pedidosNoSite: pedidos.length, ...resultado });
}
