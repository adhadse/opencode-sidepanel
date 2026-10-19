import { chmod } from "node:fs/promises";

const installer = Bun.file("install.sh");
const marker = "__SIDEPANEL_BUNDLE__\n";
const current = await installer.text();
const index = current.indexOf(marker);
if (index === -1) throw new Error("install.sh is missing its bundle marker");

const header = current.slice(0, index + marker.length);
const bundle = Buffer.from(await Bun.file("dist/tui.js").arrayBuffer()).toString("base64");
await Bun.write("install.sh", header + bundle + "\n");
await chmod("install.sh", 0o755);
