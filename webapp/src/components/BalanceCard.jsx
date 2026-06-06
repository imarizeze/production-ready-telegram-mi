import { Card } from "./Card.jsx";
import { formatDate } from "../utils/format.js";

export function BalanceCard({ wallet }) {
  const latest = wallet?.latestActivity;
  const latestText = latest
    ? `${latest.description || "Points activity"} · ${formatDate(latest.createdAt)}`
    : "No transactions yet";

  return (
    <Card>
      <div className="text-sm" style={{ color: "var(--muted)" }}>Total points</div>
      <div className="mt-2 text-5xl font-black tracking-tight">{wallet?.pointsBalance || 0}</div>
      <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm">
        Latest activity: {latestText}
      </div>
    </Card>
  );
}
