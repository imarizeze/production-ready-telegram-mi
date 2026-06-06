import { MongoClient } from "mongodb";
import { cfg } from "./config.js";
import { safeErr } from "../utils/errors.js";
import { log } from "../utils/logger.js";

let client = null;
let db = null;

export async function connectDb() {
  if (db) return db;

  if (!cfg.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for persistent wallet storage.");
  }

  try {
    client = new MongoClient(cfg.MONGODB_URI, {
      ignoreUndefined: true,
      maxPoolSize: 10,
    });

    await client.connect();
    db = client.db();
    log.info("db.connected", { mongodbUriSet: true });
    return db;
  } catch (err) {
    log.error("db.connect.failure", {
      collection: "database",
      operation: "connect",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function getDb() {
  return db || connectDb();
}

export async function ensureIndexes() {
  const database = await getDb();

  try {
    await database.collection("users").createIndex({ telegramUserId: 1 }, { unique: true });
    await database.collection("users").createIndex({ username: 1 }, { sparse: true });
    await database.collection("wallets").createIndex({ userId: 1 }, { unique: true });
    await database.collection("transactions").createIndex({ userId: 1, createdAt: -1 });
    await database.collection("transactions").createIndex({ status: 1, createdAt: -1 });
    log.info("db.indexes.ready", { collections: ["users", "wallets", "transactions"] });
  } catch (err) {
    log.error("db.indexes.failure", {
      collection: "multiple",
      operation: "ensureIndexes",
      err: safeErr(err),
    });
    throw err;
  }
}

export async function closeDb() {
  if (!client) return;
  await client.close();
  client = null;
  db = null;
}
