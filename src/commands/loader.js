import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { safeErr } from "../utils/errors.js";
import { log } from "../utils/logger.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export async function registerCommands(bot, cfg) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const commandFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".js"))
    .filter((name) => name !== "loader.js" && name !== "index.js")
    .sort();

  for (const fileName of commandFiles) {
    try {
      const moduleUrl = pathToFileURL(path.join(currentDir, fileName));
      const mod = await import(moduleUrl.href);
      const register = mod.default || mod.register;
      if (typeof register === "function") {
        register(bot, cfg);
      }
    } catch (err) {
      log.error("telegram.command.load.failure", {
        commandFile: fileName,
        err: safeErr(err),
      });
      throw err;
    }
  }

  log.info("telegram.commands.loaded", { count: commandFiles.length });
}
