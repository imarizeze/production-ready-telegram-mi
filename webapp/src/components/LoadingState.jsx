export function LoadingState() {
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
