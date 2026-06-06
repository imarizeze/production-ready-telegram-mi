export function EmptyState({ title = "No transactions yet", message = "Your activity will appear here." }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
      <div className="font-bold">{title}</div>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{message}</p>
    </div>
  );
}
