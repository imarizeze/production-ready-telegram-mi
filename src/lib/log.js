export function safeErr(err) {
  return err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    String(err);
}

function emit(level, message, meta = {}) {
  const row = {
    level,
    message,
    ts: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(row);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (message, meta) => emit("info", message, meta),
  warn: (message, meta) => emit("warn", message, meta),
  error: (message, meta) => emit("error", message, meta),
};
