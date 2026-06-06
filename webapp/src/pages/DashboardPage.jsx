import { useCallback, useEffect, useMemo, useState } from "react";
import { BalanceCard } from "../components/BalanceCard.jsx";
import { Card } from "../components/Card.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { Header } from "../components/Header.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { RecentTransactions } from "../components/RecentTransactions.jsx";
import { SummaryStats } from "../components/SummaryStats.jsx";
import { Tabs } from "../components/Tabs.jsx";
import { TransactionList } from "../components/TransactionList.jsx";
import { WelcomeCard } from "../components/WelcomeCard.jsx";
import { fetchWalletDashboard } from "../services/walletApi.js";
import { getTelegramInitData, getTelegramWebApp, initTelegramWebApp } from "../services/telegram.js";
import { displayName } from "../utils/format.js";

export function DashboardPage() {
  const tg = useMemo(() => getTelegramWebApp(), []);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    initTelegramWebApp(tg);
  }, [tg]);

  const loadWallet = useCallback(async () => {
    const initData = getTelegramInitData(tg);
    if (!initData) {
      setStatus("error");
      setError("Open Points Wallet from Telegram to view private wallet data.");
      return;
    }

    try {
      setStatus("loading");
      setError("");
      const data = await fetchWalletDashboard(initData);
      setSummary(data.summary);
      setTransactions(data.transactions);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("We could not load your wallet. Please retry in a moment.");
    }
  }, [tg]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const wallet = summary?.wallet;
  const userName = displayName(summary?.user);

  return (
    <main className="min-h-screen overflow-x-hidden px-4 pt-4 pb-8 safe-bottom">
      <div className="mx-auto max-w-md space-y-4">
        <Header onRefresh={loadWallet} />

        {status === "loading" ? <LoadingState /> : null}
        {status === "error" ? <ErrorState message={error} onRetry={loadWallet} /> : null}

        {status === "ready" ? (
          <>
            <WelcomeCard name={userName} />
            <Tabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "dashboard" ? (
              <div className="space-y-4">
                <BalanceCard wallet={wallet} />
                <SummaryStats wallet={wallet} />
                <RecentTransactions transactions={transactions} onViewAll={() => setActiveTab("transactions")} />
              </div>
            ) : (
              <Card>
                <div className="mb-3 text-lg font-bold">Transaction history</div>
                <TransactionList transactions={transactions} />
              </Card>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
