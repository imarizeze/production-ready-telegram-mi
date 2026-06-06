import { EmptyState } from "./EmptyState.jsx";
import { TransactionRow } from "./TransactionRow.jsx";

export function TransactionList({ transactions, limit }) {
  const visible = typeof limit === "number" ? transactions.slice(0, limit) : transactions;

  if (!visible.length) {
    return (
      <EmptyState
        title="No transactions yet"
        message="When you earn, spend, or receive adjustments, they will show up here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
    </div>
  );
}
