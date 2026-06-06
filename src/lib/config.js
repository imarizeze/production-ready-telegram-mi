function toPort(value) {
  const n = Number(value || 4000);
  return Number.isFinite(n) && n > 0 ? n : 4000;
}

function cleanBaseUrl(value) {
  return String(value || "")
    .replace(/\/+$/, "")
    .replace(/\/app$/i, "");
}

const PORT = toPort(process.env.PORT || 4000);

const managedBase = (
  process.env.RENDER_EXTERNAL_URL ||
  process.env.PUBLIC_BASE_URL ||
  process.env.WEBAPP_URL ||
  process.env.WEB_APP_URL ||
  process.env.PUBLIC_URL ||
  ""
).replace(/\/+$/, "").replace(/\/app$/i, "");

const appBase = cleanBaseUrl(
  managedBase ||
    process.env.APP_BASE_URL ||
    `http://localhost:${PORT}`
);

export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
  PORT,
  PUBLIC_BASE_URL: managedBase,
  APP_BASE_URL: appBase,
  MINI_APP_URL: appBase ? `${appBase}/app` : "",
};
