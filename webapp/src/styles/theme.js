export function applyTelegramTheme(tg) {
  const params = tg?.themeParams || {};
  const theme = {
    bg: params.bg_color || "#111827",
    text: params.text_color || "#f9fafb",
    muted: params.hint_color || "#9ca3af",
    card: params.secondary_bg_color || "rgba(255,255,255,0.08)",
    accent: params.button_color || "#7c3aed",
    buttonText: params.button_text_color || "#ffffff",
  };

  for (const [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }

  document.body.style.background = theme.bg;
  document.body.style.color = theme.text;
}
