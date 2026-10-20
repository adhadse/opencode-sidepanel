# OpenCode Sidepanel

A plugin-owned sidebar for **OpenCode V2**. It replaces OpenCode's native sidebar and composes the widgets selected by the plugin:

- live context-window usage
- MCP connection status
- agent and activity state
- workspace and usage details
- durable subagent history with working/finished/failed states

![OpenCode Sidepanel screenshot](assets/sidepanel-preview.svg)

## Install

### npx from GitHub (recommended)

Install the latest release directly from the public GitHub repository:

```sh
npx --yes github:adhadse/opencode-sidepanel install
```

This downloads the prebuilt plugin, installs it under `~/.config/opencode/plugins/opencode-sidepanel`, and updates `~/.config/opencode/cli.json`. Users do not need Git, Bun, an npm account, or a build step.

Restart OpenCode TUI windows after installation.

### npm registry

Once the package is published to npm, this shorter equivalent will also work:

```sh
npx opencode-sidepanel@latest install
```

Until then, use the GitHub command above.

### Alternative: standalone installer

```sh
curl -fsSL https://raw.githubusercontent.com/adhadse/opencode-sidepanel/main/install.sh | sh
```

## Develop and publish

Requirements: Bun 1.3 or newer and an npm account with permission to publish the configured package name.

```sh
bun install
bun run typecheck
bun run build
npm publish
```

`bun run build` compiles `dist/tui.js` and refreshes the standalone installer bundle. `npm pack --dry-run` is useful for checking the published contents before release.

This package exposes a `./tui` entrypoint, which is the standard OpenCode V2 CLI-plugin convention. Users can also add `"opencode-sidepanel"` directly to the `plugins` array in `cli.json` if they prefer manual configuration.

## Configure from the UI

Sidepanel owns the `sidebar.content` slot, so native sidebar widgets are replaced by the Sidepanel widgets. No OpenCode config-file edits are needed to change the layout.

Open the settings dialog with:

- `/sidepanel-settings`
- `/sidepanel-config` (alias)
- Command palette: **Configure Sidepanel widgets**

Select any widget to toggle it between shown and hidden. Settings are persisted per user and synchronized across OpenCode TUI windows.

Available widgets:

- Context
- MCP servers
- Agent
- Activity
- Workspace
- Usage
- Subagents

## Commands

- `F6` or `/sidepanel`: open the Sidepanel as a session panel
- `/sidepanel-settings`: show or hide widgets from the UI
- `/all-sessions`: find sessions across all locations

## License

MIT. See [LICENSE](LICENSE).
