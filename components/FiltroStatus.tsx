"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/types";

export default function FiltroStatus({ contagens }: { contagens: Record<string, number> }) {
  const router = useRouter();
  const params = useSearchParams();
  const atual = params.get("status") ?? "todos";

  function irPara(status: string) {
    const sp = new URLSearchParams(params.toString());
    if (status === "todos") sp.delete("status");
    else sp.set("status", status);
    router.push(`/dashboard?${sp.toString()}`);
  }

  const opcoes = ["todos", ...STATUS_ORDER];

  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((s) => (
        <button
          key={s}
          onClick={() => irPara(s)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            atual === s
              ? "border-navy bg-navy text-white"
              : "border-slate-300 bg-white text-slate-600 hover:border-navy hover:text-navy"
          }`}
        >
          {s === "todos" ? "Todos" : STATUS_LABEL[s as keyof typeof STATUS_LABEL]}
          {" "}
          <span className="opacity-70">({contagens[s] ?? 0})</span>
        </button>
      ))}
    </div>
  );
}
