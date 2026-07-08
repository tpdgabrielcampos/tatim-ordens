import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Pedido, STATUS_ORDER, StatusPedido } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import FiltroStatus from "@/components/FiltroStatus";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

async function buscarPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data as Pedido[];
}

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const pedidos = await buscarPedidos();
  const filtro = searchParams.status as StatusPedido | undefined;

  const contagens: Record<string, number> = { todos: pedidos.length };
  for (const s of STATUS_ORDER) {
    contagens[s] = pedidos.filter((p) => p.status === s).length;
  }

  const pedidosFiltrados = filtro ? pedidos.filter((p) => p.status === filtro) : pedidos;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Painel de casos</h1>
          <p className="text-sm text-slate-500">
            {pedidos.length} pedido(s) no total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/novo-pedido"
            target="_blank"
            className="rounded-lg border border-navy px-4 py-2 text-sm font-medium text-navy hover:bg-navy/5"
          >
            Ver formulário público
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6">
        <FiltroStatus contagens={contagens} />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Dentista</th>
              <th className="px-4 py-3">Trabalho</th>
              <th className="px-4 py-3">Dentes</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Recebido em</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
            {pedidosFiltrados.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/pedido/${p.id}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {p.paciente_nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.dentista_nome}</td>
                <td className="px-4 py-3 text-slate-600">{p.tipo_trabalho}</td>
                <td className="px-4 py-3 text-slate-600">
                  {p.dentes?.length ? p.dentes.join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatarData(p.prazo_desejado)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatarData(p.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
