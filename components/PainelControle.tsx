"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_LABEL, STATUS_ORDER, StatusPedido } from "@/lib/types";

export default function PainelControle({
  pedidoId,
  statusAtual,
  notasIniciais,
}: {
  pedidoId: string;
  statusAtual: StatusPedido;
  notasIniciais: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusPedido>(statusAtual);
  const [notas, setNotas] = useState(notasIniciais ?? "");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function salvar(campos: Partial<{ status: StatusPedido; notas_internas: string }>) {
    setSalvando(true);
    setMensagem(null);
    const res = await fetch(`/api/pedidos/${pedidoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campos),
    });
    setSalvando(false);

    if (res.ok) {
      setMensagem("Salvo.");
      router.refresh();
    } else {
      setMensagem("Não consegui salvar. Tente novamente.");
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-navy">Controle do laboratório</h2>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Status do caso</span>
        <select
          value={status}
          onChange={(e) => {
            const novo = e.target.value as StatusPedido;
            setStatus(novo);
            salvar({ status: novo });
          }}
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-navy focus:outline-none"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Notas internas</span>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-navy focus:outline-none"
          placeholder="Anotações só visíveis pro laboratório..."
        />
      </label>
      <button
        onClick={() => salvar({ notas_internas: notas })}
        disabled={salvando}
        className="self-start rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar notas"}
      </button>

      {mensagem && <p className="text-xs text-slate-500">{mensagem}</p>}
    </div>
  );
}
