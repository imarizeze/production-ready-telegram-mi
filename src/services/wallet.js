import { getDb } from "../lib/db.js";
import { log, safeErr } from "../lib/log.js";

function asTelegramUserId(value) {
  return String(value || "").trim();
}

function cleanMutableUser(input = {}) {
  const mutable = {
    telegramUserId: asTelegramUserId(input.id || input.telegramUserId),
    username: input.username || "",
    firstName: input.first_name || input.firstName || "",
    lastName: input.last_name || input.lastName || "",
    languageCode: input.language_code || input.languageCode || "",
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  };

  delete mutable._id;
  delete mutable.createdAt;
  return mutable;
}

export async function ensureWalletForTelegramUser(telegramUser = {}) {
  const telegramUserId = asTelegramUserId(telegramUser.id || telegramUser.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  const database = await getDb();
  const users = database.collection("users");
  const wallets = database.collection("wallets");
  const now = new Date();

  try {
    const mutableUser = cleanMutableUser({ ...telegramUser, telegramUserId });

    await users.updateOne(
      { telegramUserId },
      {
        $setOnInsert: {
          createdAt: now,
          status: "active",
          platform: "telegram",
        },
        $set: mutableUser,
      },
      { upsert: true }
    );

    await wallets.updateOne(
      { userId: telegramUserId },
      {
        $setOnInsert: {
          userId: telegramUserId,
          pointsBalance: 0,
          totalEarned: 0,
          totalSpent: 0,
          transactionCount: 0,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    const [user, wallet] = await Promise.all([
      users.findOne({ telegramUserId }),
      wallets.findOne({ userId: telegramUserId }),
    ]);

    return { user, wallet };
  } catch (err) {
    log.error("wallet.ensure.failure", {
      collection: "users,wallets",
      operation: "ensureWalletForTelegramUser",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function getWalletSummary(telegramUser) {
  const telegramUserId = asTelegramUserId(telegramUser?.id || telegramUser?.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  try {
    const { user, wallet } = await ensureWalletForTelegramUser(telegramUser);
    const database = await getDb();
    const latest = await database
      .collection("transactions")
      .find({ userId: telegramUserId })
      .sort({ })
      .limit(1)
      .toArray();

    return {
      user: {
        telegramUserId,
        username: user?.username || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      },
      wallet: {
        pointsBalance: wallet?.pointsBalance || 0,
        totalEarned: wallet?.totalEarned || 0,
        totalSpent: wallet?.totalSpent || 0,
        transactionCount: wallet?.transactionCount || 0,
        latestActivity: latest[0] || null,
      },
    };
  } catch (err) {
    log.error("wallet.summary.failure", {
      collection: "wallets",
      operation: "getWalletSummary",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function listTransactions(telegramUser, limit = 25) {
  const telegramUserId = asTelegramUserId(telegramUser?.id || telegramUser?.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  const safeLimit = Math.max(1, Math.min(Number(limit || 25), 50));

  try {
    await ensureWalletForTelegramUser(telegramUser);
    const database = await getDb();
    const docs = await database
      .collection("transactions")
      .find({ userId: telegramUserId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .toArray();

    return docs.map((doc) => ({
      id: String(doc._id),
      type: doc.type || "adjustment",
      amount: Number(doc.amount || 0),
      description: doc.description || "Points activity",
      status: doc.status || "completed",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  } catch (err) {
    log.error("wallet.transactions.failure", {
      collection: "transactions",
      operation: "listTransactions",
      err: safeErr(err),
    });
    throw err;
  }
}
