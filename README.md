# OpenCode Sidepanel

A plugin-owned sidebar for **OpenCode V2**. It replaces OpenCode's native sidebar and composes the widgets selected by the plugin:

- live context-window usage
- MCP connection status
- agent and activity state
- workspace and usage details
- durable subagent history with working/finished/failed states

## Install

### npm / npx (recommended)

After the package is published to npm, install it with one command:

```sh
npx opencode-sidepanel@latest install
```

The command adds the versioned npm package to `~/.config/opencode/cli.json`. OpenCode then downloads and loads it through its normal CLI plugin resolver. No Git clone, Bun installation, or build step is required for users.

Restart OpenCode TUI windows after installation.

To remove it, delete the `opencode-sidepanel@...` entry from the `plugins` array in `~/.config/opencode/cli.json`.

### Alternative: standalone installer

The repository also includes a prebuilt shell installer for environments where npm is unavailable:

```sh
./install.sh
```

When this repository is hosted, it can be run directly with:

```sh
curl -fsSL https://raw.githubusercontent.com/OWNER/opencode-sidepanel/main/install.sh | sh
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
