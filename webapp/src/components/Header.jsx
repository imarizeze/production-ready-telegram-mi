export function Header({ onRefresh }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <div className="text-2xl font-black tracking-tight">Points Wallet</div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>Balance and activity dashboard</div>
      </div>
      <button
        className="touch-button rounded-2xl px-4 text-sm font-bold"
        onClick={onRefresh}
        style={{ background: "var(--accent)", color: "var(--buttonText)" }}
      >
        Refresh
      </button>
    </header>
  );
}
