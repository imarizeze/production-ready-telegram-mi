import { Card } from "./Card.jsx";

export function WelcomeCard({ name }) {
  return (
    <Card className="bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10">
      <div className="text-sm" style={{ color: "var(--muted)" }}>Welcome back</div>
      <div className="mt-1 text-2xl font-black">Hi, {name}</div>
      <div className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Your wallet is synced with your Telegram account.</div>
    </Card>
  );
}
