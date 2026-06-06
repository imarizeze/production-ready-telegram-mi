import { applyTelegramTheme } from "../styles/theme.js";

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp || null;
}

export function initTelegramWebApp(tg) {
  try {
    tg?.ready?.();
    tg?.expand?.();
    tg?.disableVerticalSwipes?.();
    tg?.setHeaderColor?.(tg?.themeParams?.bg_color || "#111827");
    tg?.setBackgroundColor?.(tg?.themeParams?.bg_color || "#111827");
    applyTelegramTheme(tg);
    tg?.onEvent?.("themeChanged", () => applyTelegramTheme(tg));
  } catch {
    applyTelegramTheme(null);
  }
}

export function getTelegramInitData(tg) {
  return tg?.initData || "";
}
