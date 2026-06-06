import crypto from "node:crypto";

export function verifyTelegramInitData(initData, botToken, maxAgeSeconds = 86400) {
  const raw = String(initData || "");
  if (!raw) return { ok: false, error: "MISSING_INIT_DATA" };
  if (!botToken) return { ok: false, error: "MISSING_BOT_TOKEN" };

  const params = new URLSearchParams(raw);
  const hash = params.get("hash") || "";
  if (!hash) return { ok: false, error: "MISSING_HASH" };

  params.delete("hash");

  const pairs = [];
  for (const [key, value] of params.entries()) {
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();

  const dataCheckString = pairs.join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const left = Buffer.from(calculated, "hex");
  const right = Buffer.from(hash, "hex");
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return { ok: false, error: "BAD_HASH" };
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (maxAgeSeconds > 0 && authDate > 0) {
    const age = Math.floor(Date.now() / 1000) - authDate;
    if (age > maxAgeSeconds) return { ok: false, error: "INIT_DATA_EXPIRED" };
  }

  let user = null;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    user = null;
  }

  if (!user?.id) return { ok: false, error: "MISSING_USER" };

  return {
    ok: true,
    user,
    authDate,
  };
}
