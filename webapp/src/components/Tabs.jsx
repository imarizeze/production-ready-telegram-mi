export function Tabs({ activeTab, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1">
      <button
        className={`touch-button rounded-xl text-sm font-bold ${activeTab === "dashboard" ? "bg-white text-gray-950" : "text-white"}`}
        onClick={() => onChange("dashboard")}
      >
        Dashboard
      </button>
      <button
        className={`touch-button rounded-xl text-sm font-bold ${activeTab === "transactions" ? "bg-white text-gray-950" : "text-white"}`}
        onClick={() => onChange("transactions")}
      >
        Transactions
      </button>
    </div>
  );
}
