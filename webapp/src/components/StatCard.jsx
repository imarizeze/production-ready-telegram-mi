export function StatCard({ label, value }) {
  return (
    <div className="card min-h-[84px] justify-center">
      <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
