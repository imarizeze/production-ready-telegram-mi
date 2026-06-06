async function parseJson(response) {
  return response.json().catch(() => null);
}

async function requestJson(path, initData) {
  const response = await fetch(path, {
    headers: {
      "x-telegram-init-data": initData,
    },
  });
  const json = await parseJson(response);

  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "request_failed");
  }

  return json;
}

export async function fetchWalletDashboard(initData) {
  const [summary, transactionPage] = await Promise.all([
    requestJson("/api/wallet/summary", initData),
    requestJson("/api/wallet/transactions?limit=50", initData),
  ]);

  return {
    summary,
    transactions: transactionPage.transactions || [],
  };
}
