import { Card } from "./Card.jsx";

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="text-center">
      <div className="text-lg font-bold">Wallet unavailable</div>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{message}</p>
      <button
        className="touch-button mt-4 w-full rounded-2xl font-bold"
        onClick={onRetry}
        style={{ background: "var(--accent)", color: "var(--buttonText)" }}
      >
        Retry
      </button>
    </Card>
  );
}
