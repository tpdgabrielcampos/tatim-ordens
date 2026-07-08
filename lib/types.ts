export const STATUS_ORDER = [
  "recebido",
  "em_conferencia",
  "arquivos_confirmados",
  "aceito",
  "em_execucao",
  "concluido",
  "entregue",
  "cancelado",
] as const;

export type StatusPedido = (typeof STATUS_ORDER)[number];

export const STATUS_LABEL: Record<StatusPedido, string> = {
  recebido: "Recebido",
  em_conferencia: "Em conferência de arquivos",
  arquivos_confirmados: "Arquivos confirmados",
  aceito: "Aceito",
  em_execucao: "Em execução",
  concluido: "Concluído",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const STATUS_COLOR: Record<StatusPedido, string> = {
  recebido: "bg-slate-100 text-slate-700 border-slate-300",
  em_conferencia: "bg-amber-100 text-amber-800 border-amber-300",
  arquivos_confirmados: "bg-sky-100 text-sky-800 border-sky-300",
  aceito: "bg-indigo-100 text-indigo-800 border-indigo-300",
  em_execucao: "bg-violet-100 text-violet-800 border-violet-300",
  concluido: "bg-emerald-100 text-emerald-800 border-emerald-300",
  entregue: "bg-teal-100 text-teal-800 border-teal-300",
  cancelado: "bg-rose-100 text-rose-800 border-rose-300",
};

export const TIPOS_TRABALHO = [
  "Enceramento diagnóstico",
  "Coroa/faceta",
  "Provisório",
  "Protocolo Cerâmico",
  "Protocolo Provisório",
  "Protocolo PMMA Definitivo",
  "Placa Miorelaxante",
];

export interface PedidoFoto {
  id: string;
  pedido_id: string;
  url: string;
  created_at: string;
}

export interface Pedido {
  id: string;
  created_at: string;
  status_updated_at: string;
  paciente_nome: string;
  paciente_nascimento: string | null;
  dentista_nome: string;
  clinica: string | null;
  contato: string | null;
  tipo_trabalho: string;
  dentes: string[];
  material: string | null;
  prazo_desejado: string | null;
  observacoes: string | null;
  dscore_referencia: string | null;
  status: StatusPedido;
  notas_internas: string | null;
  pedido_fotos?: PedidoFoto[];
}
