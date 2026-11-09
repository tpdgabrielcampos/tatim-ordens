import { NextRequest, NextResponse } from "next/server";
import { audioEmFluxo, premiumAtivo } from "@/lib/vozConfig";

// Fala do assistente com a voz premium (ElevenLabs).
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!premiumAtivo()) return NextResponse.json({ ok: false, erro: "voz premium desligada" }, { status: 409 });
  const body = await req.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim().slice(0, 600) : "";
  if (!texto) return NextResponse.json({ ok: false, erro: "texto vazio" }, { status: 400 });
  const f = await audioEmFluxo(texto);
  if (!f.corpo) return NextResponse.json({ ok: false, erro: f.erro }, { status: f.status ?? 500 });
  return new NextResponse(f.corpo as BodyInit, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}
