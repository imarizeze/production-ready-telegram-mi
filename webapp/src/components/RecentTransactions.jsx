import { Card } from "./Card.jsx";
import { TransactionList } from "./TransactionList.jsx";

export function RecentTransactions({ transactions, onViewAll }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-bold">Recent transactions</div>
        <button className="text-sm font-semibold" onClick={onViewAll} style={{ color: "var(--accent)" }}>View all</button>
      </div>
      <TransactionList transactions={transactions} limit={3} />
    </Card>
  );
}
