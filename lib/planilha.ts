import { Pedido } from "@/lib/types";

// Envio de pedidos para a planilha Google, através de um Google Apps Script
// publicado como App da Web. O endereço fica na variável de ambiente
// GOOGLE_SHEETS_WEBHOOK_URL (só no servidor — nunca vai pro navegador).

const FUSO = "America/Sao_Paulo";

function dataHora(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", { timeZone: FUSO });
}

// Datas "só dia" vêm do banco como AAAA-MM-DD; reformatar na mão evita que o
// fuso horário empurre a data para o dia anterior.
function soData(valor: string | null) {
  if (!valor) return "";
  const [ano, mes, dia] = valor.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : valor;
}

// Uma linha da planilha, na ordem exata das colunas.
export function linhaDaPlanilha(p: Pedido): string[] {
  return [
    p.id,
    dataHora(p.created_at),
    p.paciente_nome ?? "",
    p.dentista_nome ?? "",
    p.tipo_trabalho ?? "",
    (p.dentes ?? []).join(", "),
    p.material ?? "",
    p.cor_restauracao ?? "",
    soData(p.prazo_desejado),
    soData(p.instalacao_agendada),
    p.quem_preencheu ?? "",
    p.observacoes ?? "",
    (p.pedido_fotos ?? []).map((f) => f.url).join("\n"),
  ];
}

export interface ResultadoPlanilha {
  ok: boolean;
  adicionados?: number;
  ignorados?: number;
  erro?: string;
}

export async function enviarParaPlanilha(
  pedidos: Pedido[],
  timeoutMs = 8000
): Promise<ResultadoPlanilha> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return { ok: false, erro: "GOOGLE_SHEETS_WEBHOOK_URL não configurada" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linhas: pedidos.map(linhaDaPlanilha) }),
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const texto = await res.text();
    if (!res.ok) return { ok: false, erro: `HTTP ${res.status}: ${texto.slice(0, 200)}` };
    try {
      return JSON.parse(texto) as ResultadoPlanilha;
    } catch {
      // Página HTML em vez de JSON = script não publicado para "Qualquer pessoa".
      return { ok: false, erro: `Resposta inesperada do Apps Script: ${texto.slice(0, 200)}` };
    }
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err) };
  }
}
