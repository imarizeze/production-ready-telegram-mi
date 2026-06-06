import { getDb } from "../lib/db.js";
import { safeErr } from "../utils/errors.js";
import { log } from "../utils/logger.js";

function collection(database, name) {
  return database.collection(name);
}

export function normalizeTelegramUserId(value) {
  return String(value || "").trim();
}

export function toUserProfileFields(telegramUser = {}) {
  const mutable = {
    telegramUserId: normalizeTelegramUserId(telegramUser.id || telegramUser.telegramUserId),
    username: telegramUser.username || "",
    firstName: telegramUser.first_name || telegramUser.firstName || "",
    lastName: telegramUser.last_name || telegramUser.lastName || "",
    languageCode: telegramUser.language_code || telegramUser.languageCode || "",
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  };

  delete mutable._id;
  delete mutable.createdAt;
  return mutable;
}

export async function upsertUserProfile(telegramUser = {}) {
  const telegramUserId = normalizeTelegramUserId(telegramUser.id || telegramUser.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  const database = await getDb();
  const users = collection(database, "users");
  const now = new Date();
  const mutableUser = toUserProfileFields({ ...telegramUser, telegramUserId });

  try {
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

    return users.findOne({ telegramUserId });
  } catch (err) {
    log.error("repository.users.upsert.failure", {
      collection: "users",
      operation: "upsertUserProfile",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function upsertWallet(telegramUserId) {
  const userId = normalizeTelegramUserId(telegramUserId);
  if (!userId) throw new Error("Wallet user id is required.");

  const database = await getDb();
  const wallets = collection(database, "wallets");
  const now = new Date();

  try {
    await wallets.updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
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

    return wallets.findOne({ userId });
  } catch (err) {
    log.error("repository.wallets.upsert.failure", {
      collection: "wallets",
      operation: "upsertWallet",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function findLatestTransaction(telegramUserId) {
  const userId = normalizeTelegramUserId(telegramUserId);
  const database = await getDb();

  try {
    return collection(database, "transactions")
      .find({ userId })
      .sort({ })
      .limit(1)
      .next();
  } catch (err) {
    log.error("repository.transactions.latest.failure", {
      collection: "transactions",
      operation: "findLatestTransaction",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function listWalletTransactions(telegramUserId, limit = 25) {
  const userId = normalizeTelegramUserId(telegramUserId);
  const safeLimit = Math.max(1, Math.min(Number(limit || 25), 50));
  const database = await getDb();

  try {
    return collection(database, "transactions")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .toArray();
  } catch (err) {
    log.error("repository.transactions.list.failure", {
      collection: "transactions",
      operation: "listWalletTransactions",
      err: safeErr(err),
    });
    throw err;
  }
}
