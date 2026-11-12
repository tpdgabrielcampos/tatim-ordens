"use client";

import { useEffect, useState } from "react";
import MascoteGC, { type HumorMascote } from "@/components/MascoteGC";

// O assistente GC grande ao lado do formulário (só em telas largas, onde sobra espaço).
// Tocar nele abre o preenchimento por voz.
export default function MascoteLateral({ humor, onTocar }: { humor: HumorMascote; onTocar: () => void }) {
  const [tamanho, setTamanho] = useState(0);

  useEffect(() => {
    const medir = () => {
      const livre = (window.innerWidth - 672) / 2 - 56; // 672 = largura do formulário
      const porLargura = livre / (1438 / 2576);
      const t = Math.min(window.innerHeight * 0.82, porLargura, 720);
      setTamanho(t >= 300 ? Math.round(t) : 0);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  if (!tamanho) return null;
  const largura = tamanho * (1438 / 2576);

  return (
    <div className="fixed bottom-0 z-20 flex flex-col items-center" style={{ left: `calc(50% - 336px - 40px - ${largura}px)`, width: largura }}>
      <button type="button" onClick={onTocar} className="group relative flex flex-col items-center" aria-label="Preencher a OS por voz com o assistente GC">
        <span className="absolute -top-4 left-1/2 w-max max-w-[16rem] -translate-x-1/2 rounded-2xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white opacity-90 backdrop-blur transition group-hover:opacity-100">
          Me toque para preencher por voz!
        </span>
        <MascoteGC humor={humor} variante="corpo" tamanho={tamanho} />
      </button>
    </div>
  );
}
