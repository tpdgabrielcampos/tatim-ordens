"use client";

// Seletor de dentes em notação FDI (padrão usado no Brasil), dividido nos
// 4 quadrantes. Clique para marcar/desmarcar cada dente.

const QUADRANTE_SUPERIOR_DIREITO = ["18", "17", "16", "15", "14", "13", "12", "11"];
const QUADRANTE_SUPERIOR_ESQUERDO = ["21", "22", "23", "24", "25", "26", "27", "28"];
const QUADRANTE_INFERIOR_ESQUERDO = ["31", "32", "33", "34", "35", "36", "37", "38"];
const QUADRANTE_INFERIOR_DIREITO = ["48", "47", "46", "45", "44", "43", "42", "41"];

interface Props {
  selecionados: string[];
  onChange: (dentes: string[]) => void;
}

function Dente({
  numero,
  ativo,
  onClick,
}: {
  numero: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 w-9 shrink-0 rounded-md border text-xs font-medium transition-colors ${
        ativo
          ? "border-navy bg-navy text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-navy hover:text-navy"
      }`}
    >
      {numero}
    </button>
  );
}

export default function OdontogramaSelector({ selecionados, onChange }: Props) {
  function toggle(numero: string) {
    if (selecionados.includes(numero)) {
      onChange(selecionados.filter((d) => d !== numero));
    } else {
      onChange([...selecionados, numero].sort());
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mx-auto flex w-fit flex-col gap-2">
        <div className="flex gap-6">
          <div className="flex gap-1">
            {QUADRANTE_SUPERIOR_DIREITO.map((n) => (
              <Dente key={n} numero={n} ativo={selecionados.includes(n)} onClick={() => toggle(n)} />
            ))}
          </div>
          <div className="flex gap-1">
            {QUADRANTE_SUPERIOR_ESQUERDO.map((n) => (
              <Dente key={n} numero={n} ativo={selecionados.includes(n)} onClick={() => toggle(n)} />
            ))}
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex gap-1">
            {QUADRANTE_INFERIOR_DIREITO.map((n) => (
              <Dente key={n} numero={n} ativo={selecionados.includes(n)} onClick={() => toggle(n)} />
            ))}
          </div>
          <div className="flex gap-1">
            {QUADRANTE_INFERIOR_ESQUERDO.map((n) => (
              <Dente key={n} numero={n} ativo={selecionados.includes(n)} onClick={() => toggle(n)} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        {selecionados.length === 0
          ? "Clique nos dentes envolvidos no trabalho"
          : `Selecionados: ${selecionados.join(", ")}`}
      </p>
    </div>
  );
}
