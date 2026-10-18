import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin";
import { readdir, unlink } from "node:fs/promises";
import { basename } from "node:path";

const result = await Bun.build({
  entrypoints: ["./tui.tsx"],
  outdir: "./dist",
  target: "bun",
  format: "esm",
  // OpenTUI's runtime import rewriter matches `from\s+"..."`.
  // Keep whitespace so runtime dependencies bind to the host's Solid instance.
  minify: { identifiers: true, syntax: true, whitespace: false },
  splitting: false,
  sourcemap: "none",
  tsconfig: "./tsconfig.json",
  external: [
    "@opentui/core",
    "@opentui/solid",
    "@opentui/solid/*",
    "solid-js",
    "solid-js/*",
    "@opencode/plugin",
    "@opencode/plugin/*",
  ],
  plugins: [createSolidTransformPlugin()],
});

if (!result.success) throw new Error("Sidepanel plugin build failed");

// Remove superseded generated chunks after a successful build. The entrypoint
// and unrelated files are preserved, including when a build fails.
const current = new Set(result.outputs.map((file) => basename(file.path)));
for (const name of await readdir("./dist")) {
  if (/^chunk-[a-z0-9]+\.js$/.test(name) && !current.has(name)) {
    await unlink(`./dist/${name}`);
  }
}
