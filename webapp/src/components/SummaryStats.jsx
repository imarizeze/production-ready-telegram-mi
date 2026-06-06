import { StatCard } from "./StatCard.jsx";

export function SummaryStats({ wallet }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Earned" value={wallet?.totalEarned || 0} />
      <StatCard label="Spent" value={wallet?.totalSpent || 0} />
      <StatCard label="Records" value={wallet?.transactionCount || 0} />
    </div>
  );
}
