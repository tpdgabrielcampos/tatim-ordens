"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { TIPOS_TRABALHO } from "@/lib/types";
import OdontogramaSelector from "@/components/OdontogramaSelector";

type EstadoEnvio = "idle" | "enviando" | "sucesso" | "erro";

const FUNDO_PAGINA =
  "min-h-screen bg-white bg-[url('/fundo.jpg')] bg-cover bg-center bg-no-repeat bg-fixed";

export default function NovoPedidoPage() {
  const [estado, setEstado] = useState<EstadoEnvio>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [dentes, setDentes] = useState<string[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);
  const [tipoTrabalho, setTipoTrabalho] = useState(TIPOS_TRABALHO[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEstado("enviando");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      // Gera o id no navegador em vez de pedir de volta do banco (.select()):
      // como o formulário é público, só liberamos permissão de CRIAR pedidos
      // pra quem não está logado, não de LER — então não dá pra pedir o Supabase
      // pra devolver a linha recém-criada.
      const pedidoId = crypto.randomUUID();

      const { error: erroPedido } = await supabaseBrowser.from("pedidos").insert({
        id: pedidoId,
        paciente_nome: String(data.get("paciente_nome") ?? ""),
        dentista_nome: String(data.get("dentista_nome") ?? ""),
        tipo_trabalho: tipoTrabalho,
        dentes,
        material: (data.get("material") as string) || null,
        cor_restauracao: (data.get("cor_restauracao") as string) || null,
        prazo_desejado: (data.get("prazo_desejado") as string) || null,
        observacoes: (data.get("observacoes") as string) || null,
      });

      if (erroPedido) throw erroPedido;

      // Upload das fotos (se houver) para o bucket público "pedido-fotos"
      for (const foto of fotos) {
        const caminho = `${pedidoId}/${Date.now()}-${foto.name}`;
        const { error: erroUpload } = await supabaseBrowser.storage
          .from("pedido-fotos")
          .upload(caminho, foto);

        if (erroUpload) throw erroUpload;

        const { data: urlPublica } = supabaseBrowser.storage
          .from("pedido-fotos")
          .getPublicUrl(caminho);

        await supabaseBrowser.from("pedido_fotos").insert({
          pedido_id: pedidoId,
          url: urlPublica.publicUrl,
        });
      }

      // Cria o cartão no Trello em segundo plano. Se falhar, o pedido já
      // está salvo mesmo assim — não bloqueia a confirmação pro dentista.
      fetch("/api/trello/criar-cartao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      }).catch(() => {});

      setEstado("sucesso");
      form.reset();
      setDentes([]);
      setFotos([]);
      setTipoTrabalho(TIPOS_TRABALHO[0]);
    } catch (err) {
      console.error(err);
      const detalhe = err instanceof Error ? err.message : String(err);
      setErro(
        `Não consegui enviar a ordem de serviço. Detalhe: ${detalhe}`
      );
      setEstado("erro");
    }
  }

  if (estado === "sucesso") {
    return (
      <div className={FUNDO_PAGINA}>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="rounded-full bg-emerald-100 p-4 text-emerald-700">✓</div>
          <h1 className="text-2xl font-bold text-navy">Ordem de serviço enviada!</h1>
          <p className="text-slate-600">
            Recebemos os dados do caso. Vamos conferir os arquivos do paciente
            no DS Core e retornar assim que o trabalho for aceito.
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="mt-4 rounded-lg bg-navy px-5 py-2.5 font-medium text-white hover:bg-navy/90"
          >
            Enviar outra ordem
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={FUNDO_PAGINA}>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-gabriel-campos.png"
            alt="Gabriel Campos"
            className="w-40 sm:w-48"
          />
        </div>

        <div className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-bold text-navy">Nova ordem de serviço</h1>
          <p className="mt-1 text-sm text-slate-600">
            Preencha os dados do caso. Os arquivos de escaneamento (.ply)
            continuam sendo enviados separadamente pelo DS Core.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <fieldset className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-navy">
                Dados do paciente
              </legend>
              <Campo label="Nome do paciente" name="paciente_nome" required />
            </fieldset>

            <fieldset className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-navy">
                Seus dados (dentista)
              </legend>
              <Campo label="Seu nome" name="dentista_nome" required />
            </fieldset>

            <fieldset className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-navy">
                Trabalho a ser realizado
              </legend>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Tipo de trabalho</span>
                <select
                  value={tipoTrabalho}
                  onChange={(e) => setTipoTrabalho(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 focus:border-navy focus:outline-none"
                >
                  {TIPOS_TRABALHO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Dentes envolvidos
                </span>
                <OdontogramaSelector selecionados={dentes} onChange={setDentes} />
              </div>

              <Campo
                label="Material desejado"
                name="material"
                required
                placeholder="Ex: Zircônia, e.max, PMMA..."
              />
              <Campo
                label="Cor final da restauração"
                name="cor_restauracao"
                required
                placeholder="Ex: A2, A3.5, BL2..."
              />
              <Campo label="Prazo desejado" name="prazo_desejado" type="date" />
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Observações</span>
                <textarea
                  name="observacoes"
                  rows={3}
                  className="rounded-md border border-slate-300 px-3 py-2 focus:border-navy focus:outline-none"
                  placeholder="Detalhes do caso, cor, instruções específicas..."
                />
              </label>
            </fieldset>

            <fieldset className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-navy">
                Fotos (opcional)
              </legend>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFotos(Array.from(e.target.files ?? []))}
                className="text-sm"
              />
              {fotos.length > 0 && (
                <p className="text-xs text-slate-500">
                  {fotos.length} foto(s) selecionada(s)
                </p>
              )}
            </fieldset>

            {erro && (
              <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={estado === "enviando"}
              className="rounded-lg bg-navy px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-navy/90 disabled:opacity-60"
            >
              {estado === "enviando" ? "Enviando..." : "Enviar ordem de serviço"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-slate-300 px-3 py-2 focus:border-navy focus:outline-none"
      />
    </label>
  );
}
