import { formatDate } from "../utils/format.js";

export function TransactionRow({ tx }) {
  const isDebit = tx.type === "spend";
  const amount = Number(tx.amount || 0);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2 py-1 text-[11px] font-semibold capitalize bg-white/10">{tx.type}</span>
          <span className="text-[11px] capitalize" style={{ color: "var(--muted)" }}>{tx.status}</span>
        </div>
        <div className="mt-2 truncate text-sm font-semibold">{tx.description || "Points activity"}</div>
        <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{formatDate(tx.createdAt)}</div>
      </div>
      <div className={`shrink-0 text-right text-base font-bold ${isDebit ? "text-rose-300" : "text-emerald-300"}`}>
        {isDebit ? "-" : "+"}{Math.abs(amount)}
      </div>
    </div>
  );
}
