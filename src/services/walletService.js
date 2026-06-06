import {
  findLatestTransaction,
  listWalletTransactions,
  normalizeTelegramUserId,
  upsertUserProfile,
  upsertWallet,
} from "../repositories/walletRepository.js";
import { safeErr } from "../utils/errors.js";
import { log } from "../utils/logger.js";

function publicUser(user, telegramUserId) {
  return {
    telegramUserId,
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  };
}

function publicWallet(wallet, latestActivity) {
  return {
    pointsBalance: Number(wallet?.pointsBalance || 0),
    totalEarned: Number(wallet?.totalEarned || 0),
    totalSpent: Number(wallet?.totalSpent || 0),
    transactionCount: Number(wallet?.transactionCount || 0),
    latestActivity: latestActivity || null,
  };
}

function publicTransaction(doc) {
  return {
    id: String(doc._id),
    type: doc.type || "adjustment",
    amount: Number(doc.amount || 0),
    description: doc.description || "Points activity",
    status: doc.status || "completed",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function ensureWalletForTelegramUser(telegramUser = {}) {
  const telegramUserId = normalizeTelegramUserId(telegramUser.id || telegramUser.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  try {
    const user = await upsertUserProfile({ ...telegramUser, telegramUserId });
    const wallet = await upsertWallet(telegramUserId);
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
  const telegramUserId = normalizeTelegramUserId(telegramUser?.id || telegramUser?.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  try {
    const { user, wallet } = await ensureWalletForTelegramUser(telegramUser);
    const latestActivity = await findLatestTransaction(telegramUserId);

    return {
      user: publicUser(user, telegramUserId),
      wallet: publicWallet(wallet, latestActivity),
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
  const telegramUserId = normalizeTelegramUserId(telegramUser?.id || telegramUser?.telegramUserId);
  if (!telegramUserId) throw new Error("Telegram user id is required.");

  try {
    await ensureWalletForTelegramUser(telegramUser);
    const docs = await listWalletTransactions(telegramUserId, limit);
    return docs.map(publicTransaction);
  } catch (err) {
    log.error("wallet.transactions.failure", {
      collection: "transactions",
      operation: "listTransactions",
      err: safeErr(err),
    });
    throw err;
  }
}
