import { NextResponse } from "next/server";
import { PAUSA, VOZ, premiumAtivo } from "@/lib/vozConfig";

export const dynamic = "force-dynamic";

// O que a tela precisa saber do assistente (sem nada secreto).
export async function GET() {
  return NextResponse.json({ premium: premiumAtivo(), velocidade: VOZ.velocidade, pausa: PAUSA, ativo: !!process.env.ANTHROPIC_API_KEY });
}
