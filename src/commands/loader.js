import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export async function registerCommands(bot, cfg) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".js")) continue;
    if (entry.name === "loader.js" || entry.name === "index.js") continue;

    const moduleUrl = pathToFileURL(path.join(currentDir, entry.name));
    const mod = await import(moduleUrl.href);
    const register = mod.default || mod.register;
    if (typeof register === "function") {
      register(bot, cfg);
    }
  }
}
