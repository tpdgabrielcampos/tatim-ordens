import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Voz premium (ElevenLabs) do assistente. Usa a mesma voz do OS digital GC;
// dá para trocar pelas variáveis de ambiente do Vercel, se quiser.
export const VOZ = {
  voz_id: process.env.ELEVENLABS_VOICE_ID || "ohZOfA9iwlZ5nOsoY7LB",
  modelo: process.env.ELEVENLABS_MODEL || "eleven_v4",
  velocidade: Number(process.env.ELEVENLABS_SPEED) || 1,
  estabilidade: 0.5,
  estilo: 0,
};
export const PAUSA = Number(process.env.VOZ_PAUSA_MS) || 1300;

export const premiumAtivo = () => !!process.env.ELEVENLABS_API_KEY && !!VOZ.voz_id;

const BUCKET = "voz-cache";
let bucketOk = false;

async function garantirBucket() {
  if (bucketOk) return;
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) await supabaseAdmin.storage.createBucket(BUCKET, { public: false }).catch(() => null);
  bucketOk = true;
}

/**
 * Áudio de uma frase: do cache (frases repetidas não gastam crédito de novo) ou
 * gerado pela ElevenLabs, já indo aos pedaços para o navegador começar a tocar antes.
 */
export async function audioEmFluxo(texto: string): Promise<{ corpo?: ReadableStream<Uint8Array> | ArrayBuffer; erro?: string; status?: number }> {
  const chave = process.env.ELEVENLABS_API_KEY;
  if (!chave) return { erro: "voz premium não configurada", status: 409 };
  await garantirBucket().catch(() => null);
  const caminho =
    createHash("sha256").update([VOZ.voz_id, VOZ.modelo, VOZ.velocidade, VOZ.estabilidade, VOZ.estilo, texto].join("|")).digest("hex") + ".mp3";
  const { data: guardado } = await supabaseAdmin.storage.from(BUCKET).download(caminho);
  if (guardado) return { corpo: await guardado.arrayBuffer() };

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOZ.voz_id)}/stream?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": chave, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: texto,
      model_id: VOZ.modelo,
      voice_settings: {
        stability: VOZ.estabilidade,
        similarity_boost: 0.75,
        style: VOZ.estilo,
        use_speaker_boost: true,
        speed: Math.min(1.2, Math.max(0.7, VOZ.velocidade)),
      },
    }),
  });
  if (!r.ok || !r.body) {
    const detalhe = (await r.text().catch(() => "")).slice(0, 300);
    console.error("[voz/falar] elevenlabs", r.status, detalhe);
    return { erro: `ElevenLabs respondeu ${r.status}`, status: 502 };
  }
  const leitor = r.body.getReader();
  const partes: Uint8Array[] = [];
  const corpo = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      const { done, value } = await leitor.read();
      if (value) {
        partes.push(value);
        ctrl.enqueue(value);
      }
      if (done) {
        const tudo = new Uint8Array(partes.reduce((n, p) => n + p.length, 0));
        let i = 0;
        for (const p of partes) {
          tudo.set(p, i);
          i += p.length;
        }
        await supabaseAdmin.storage.from(BUCKET).upload(caminho, tudo, { contentType: "audio/mpeg", upsert: true }).catch(() => null);
        ctrl.close();
      }
    },
    cancel() {
      leitor.cancel().catch(() => {});
    },
  });
  return { corpo };
}
