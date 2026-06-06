import React, { useCallback, useEffect, useMemo, useState } from "react";

function getTelegramWebApp() {
  return window?.Telegram?.WebApp || null;
}

function applyTheme(tg) {
  const p = tg?.themeParams || {};
  const bg = p.bg_color || "#111827";
  const text = p.text_color || "#f9fafb";
  const hint = p.hint_color || "#9ca3af";
  const card = p.secondary_bg_color || "rgba(255,255,255,0.08)";
  const accent = p.button_color || "#7c3aed";
  const buttonText = p.button_text_color || "#ffffff";

  document.documentElement.style.setProperty("--bg", bg);
  document.documentElement.style.setProperty("--text", text);
  document.documentElement.style.setProperty("--muted", hint);
  document.documentElement.style.setProperty("--card", card);
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--buttonText", buttonText);
  document.body.style.background = bg;
  document.body.style.color = text;
}

function formatDate(value) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-3xl bg-white/10" />
      <div className="h-40 rounded-3xl bg-white/10" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-2xl bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Stat({ label, value }) {
  return (
    <div className="card min-h-[84px] justify-center">
      <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function TransactionRow({ tx }) {
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

export default function App() {
  const tg = useMemo(() => getTelegramWebApp(), []);
  const [tab, setTab] = useState("dashboard");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    try {
      tg?.ready?.();
      tg?.expand?.();
      tg?.disableVerticalSwipes?.();
      tg?.setHeaderColor?.(tg?.themeParams?.bg_color || "#111827");
      tg?.setBackgroundColor?.(tg?.themeParams?.bg_color || "#111827");
      applyTheme(tg);
      tg?.onEvent?.("themeChanged", () => applyTheme(tg));
    } catch {
      applyTheme(null);
    }
  }, [tg]);

  const loadWallet = useCallback(async () => {
    const initData = tg?.initData || "";
    if (!initData) {
      setStatus("error");
      setError("Open Points Wallet from Telegram to view private wallet data.");
      return;
    }

    try {
      setStatus("loading");
      setError("");

      const headers = { "x-telegram-init-data": initData };
      const [summaryResp, txResp] = await Promise.all([
        fetch("/api/wallet/summary", { headers }),
        fetch("/api/wallet/transactions?limit=50", { headers }),
      ]);

      const summaryJson = await summaryResp.json().catch(() => null);
      const txJson = await txResp.json().catch(() => null);

      if (!summaryResp.ok || !summaryJson?.ok) throw new Error(summaryJson?.error || "summary_failed");
      if (!txResp.ok || !txJson?.ok) throw new Error(txJson?.error || "transactions_failed");

      setSummary(summaryJson);
      setTransactions(txJson.transactions || []);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("We could not load your wallet. Please retry in a moment.");
    }
  }, [tg]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const user = summary?.user;
  const wallet = summary?.wallet;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "there";
  const latest = wallet?.latestActivity;

  return (
    <main className="min-h-screen overflow-x-hidden px-4 pt-4 pb-8 safe-bottom">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-black tracking-tight">Points Wallet</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>Balance and activity dashboard</div>
          </div>
          <button className="touch-button rounded-2xl px-4 text-sm font-bold" onClick={loadWallet} style={{ background: "var(--accent)", color: "var(--buttonText)" }}>
            Refresh
          </button>
        </header>

        {status === "loading" ? <Skeleton /> : null}

        {status === "error" ? (
          <Card className="text-center">
            <div className="text-lg font-bold">Wallet unavailable</div>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{error}</p>
            <button className="touch-button mt-4 w-full rounded-2xl font-bold" onClick={loadWallet} style={{ background: "var(--accent)", color: "var(--buttonText)" }}>
              Retry
            </button>
          </Card>
        ) : null}

        {status === "ready" ? (
          <>
            <Card className="bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10">
              <div className="text-sm" style={{ color: "var(--muted)" }}>Welcome back</div>
              <div className="mt-1 text-2xl font-black">Hi, {displayName}</div>
              <div className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Your wallet is synced with your Telegram account.</div>
            </Card>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1">
              <button className={`touch-button rounded-xl text-sm font-bold ${tab === "dashboard" ? "bg-white text-gray-950" : "text-white"}`} onClick={() => setTab("dashboard")}>Dashboard</button>
              <button className={`touch-button rounded-xl text-sm font-bold ${tab === "transactions" ? "bg-white text-gray-950" : "text-white"}`} onClick={() => setTab("transactions")}>Transactions</button>
            </div>

            {tab === "dashboard" ? (
              <div className="space-y-4">
                <Card>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>Total points</div>
                  <div className="mt-2 text-5xl font-black tracking-tight">{wallet?.pointsBalance || 0}</div>
                  <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm">
                    Latest activity: {latest ? `${latest.description || "Points activity"} · ${formatDate(latest.createdAt)}` : "No transactions yet"}
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Earned" value={wallet?.totalEarned || 0} />
                  <Stat label="Spent" value={wallet?.totalSpent || 0} />
                  <Stat label="Records" value={wallet?.transactionCount || 0} />
                </div>

                <Card>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="font-bold">Recent transactions</div>
                    <button className="text-sm font-semibold" onClick={() => setTab("transactions")} style={{ color: "var(--accent)" }}>View all</button>
                  </div>
                  {transactions.length ? (
                    <div className="space-y-2">{transactions.slice(0, 3).map((tx) => <TransactionRow key={tx.id} tx={tx} />)}</div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm" style={{ color: "var(--muted)" }}>No transactions yet. Your activity will appear here.</div>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="mb-3 text-lg font-bold">Transaction history</div>
                {transactions.length ? (
                  <div className="space-y-2">{transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}</div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                    <div className="font-bold">No transactions yet</div>
                    <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>When you earn, spend, or receive adjustments, they will show up here.</p>
                  </div>
                )}
              </Card>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
