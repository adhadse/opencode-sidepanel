# OpenCode Sidepanel

A plugin-owned sidebar for **OpenCode V2**. It replaces OpenCode's native sidebar and composes the widgets selected by the plugin:

- live context-window usage
- MCP connection status
- agent and activity state
- workspace and usage details
- durable subagent history with working/finished/failed states

## Requirements

- OpenCode V2 (tested with 2.0.32)
- Bun 1.3 or newer, only when building from source

## Install from a clone

```sh
git clone <repository-url> ~/Documents/opencode-sidepanel
cd ~/Documents/opencode-sidepanel
bun install
bun run build
```

Add the absolute path to the OpenCode CLI plugin list in `~/.config/opencode/cli.json`:

``json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "plugins": [
    "/absolute/path/to/opencode-sidepanel"
  ]
}
```

Restart OpenCode after changing the plugin list.

## Develop locally

OpenCode discovers `tui.tsx` from the plugin directory. After editing it, run:

```sh
bun run typecheck
bun run build
```

Restart the TUI if it does not hot-reload the plugin.

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
