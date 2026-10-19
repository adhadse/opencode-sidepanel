#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const command = process.argv[2] ?? "install";

if (command !== "install") {
  console.error("Usage: npx opencode-sidepanel@latest install");
  process.exit(1);
}

const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
const configDir = join(configHome, "opencode");
const configPath = join(configDir, "cli.json");
const packageSpecifier = manifest.name + "@" + manifest.version;

mkdirSync(configDir, { recursive: true });
let config = { $schema: "https://opencode.ai/v2/cli.json" };
if (existsSync(configPath)) {
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    console.error("Refusing to modify invalid JSON: " + configPath);
    console.error(String(error));
    process.exit(1);
  }
  copyFileSync(configPath, configPath + ".sidepanel-backup");
}

if (!Array.isArray(config.plugins)) {
  if (config.plugins !== undefined) {
    console.error("Refusing to modify cli.json: plugins is not an array.");
    process.exit(1);
  }
  config.plugins = [];
}

const localInstallPaths = new Set([
  join(configDir, "plugins", "opencode-sidepanel"),
  join(configDir, "plugins", "sidepanel"),
]);
config.plugins = config.plugins.filter((entry) => {
  if (typeof entry !== "string") return true;
  return !(
    entry === manifest.name ||
    entry.startsWith(manifest.name + "@") ||
    localInstallPaths.has(entry)
  );
});
config.plugins.push(packageSpecifier);

const temporary = configPath + ".tmp." + process.pid;
writeFileSync(temporary, JSON.stringify(config, null, 2) + "\n");
renameSync(temporary, configPath);
console.log("Installed " + packageSpecifier + " in " + configPath);
console.log("Restart OpenCode TUI windows to load the plugin.");
