import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Pedido } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import PainelControle from "@/components/PainelControle";

export const dynamic = "force-dynamic";

async function buscarPedido(id: string): Promise<Pedido | null> {
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("*, pedido_fotos(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Pedido;
}

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function PedidoDetalhePage({ params }: { params: { id: string } }) {
  const pedido = await buscarPedido(params.id);
  if (!pedido) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-navy">
        ← Voltar ao painel
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">{pedido.paciente_nome}</h1>
        <StatusBadge status={pedido.status} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <Secao titulo="Dados do paciente">
            <Linha label="Nome" valor={pedido.paciente_nome} />
          </Secao>

          <Secao titulo="Dentista">
            <Linha label="Dentista" valor={pedido.dentista_nome} />
          </Secao>

          <Secao titulo="Trabalho">
            <Linha label="Tipo" valor={pedido.tipo_trabalho} />
            <Linha
              label="Dentes"
              valor={pedido.dentes?.length ? pedido.dentes.join(", ") : "—"}
            />
            <Linha label="Material" valor={pedido.material ?? "—"} />
            <Linha label="Prazo desejado" valor={formatarData(pedido.prazo_desejado)} />
            <Linha label="Observações" valor={pedido.observacoes ?? "—"} multiline />
          </Secao>

          {pedido.pedido_fotos && pedido.pedido_fotos.length > 0 && (
            <Secao titulo="Fotos enviadas pelo dentista">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pedido.pedido_fotos.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg border border-slate-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt="Foto do caso"
                      className="h-32 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </Secao>
          )}
        </div>

        <div>
          <PainelControle
            pedidoId={pedido.id}
            statusAtual={pedido.status}
            notasIniciais={pedido.notas_internas}
          />
          <p className="mt-4 text-xs text-slate-400">
            Recebido em {formatarData(pedido.created_at)}
          </p>
        </div>
      </div>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-navy">{titulo}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Linha({
  label,
  valor,
  multiline = false,
}: {
  label: string;
  valor: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col text-sm sm:flex-row sm:gap-2">
      <span className="w-40 shrink-0 text-slate-500">{label}</span>
      <span className={`text-slate-800 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {valor}
      </span>
    </div>
  );
}
