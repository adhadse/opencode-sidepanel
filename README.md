# OpenCode Sidepanel

A plugin-owned sidebar for **OpenCode V2**. It replaces OpenCode's native sidebar and composes the widgets selected by the plugin:

- live context-window usage
- MCP connection status
- agent and activity state
- workspace and usage details
- durable subagent history with working/finished/failed states

## Install

### One command (recommended)

After this repository is published, users install the prebuilt plugin with one command:

```sh
curl -fsSL https://raw.githubusercontent.com/OWNER/opencode-sidepanel/main/install.sh | sh
```

Replace `OWNER` with the GitHub account or organization that hosts this repository.

The installer writes the prebuilt plugin to `~/.config/opencode/plugins/opencode-sidepanel`, adds it to `~/.config/opencode/cli.json`, and saves a `.sidepanel-backup` copy of an existing CLI configuration. It needs only `sh`, `python3`, and `base64`; it does **not** require Git, Bun, or a build step.

Restart OpenCode TUI windows after installation.

### From a local checkout

```sh
./install.sh
```

## Develop locally

Requirements: OpenCode V2 (tested with 2.0.32) and Bun 1.3 or newer.

```sh
bun install
bun run typecheck
bun run build
```

`bun run build` compiles `dist/tui.js` and refreshes the installer bundle.

## Widget composition

The plugin uses a `replace: "sidebar.content"` slot claim. This intentionally suppresses OpenCode's native sidebar contents, so the plugin completely controls what appears there.

Choose visible widgets near the top of `tui.tsx`:

```ts
const WIDGETS = {
  context: true,
  mcp: true,
  agent: true,
  activity: true,
  workspace: true,
  usage: true,
  subagents: true,
} as const;
```

Set a value to `false` to hide that widget. The MCP widget reads live V2 MCP status through the OpenCode plugin data API.

## Commands

- `F6` or `/sidepanel`: open the Sidepanel as a session panel
- `/all-sessions`: find sessions across all locations

## License

MIT. See [LICENSE](LICENSE).
