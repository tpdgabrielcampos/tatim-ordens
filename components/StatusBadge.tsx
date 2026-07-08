import { STATUS_COLOR, STATUS_LABEL, StatusPedido } from "@/lib/types";

export default function StatusBadge({ status }: { status: StatusPedido }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
