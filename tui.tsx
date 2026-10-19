import { Plugin } from "@opencode/plugin/tui";
import { createEffect, createMemo, For, Show } from "solid-js";

type Any = Record<string, any>;
const obj = (v: unknown): Any => v && typeof v === "object" ? v as Any : {};
const num = (v: unknown): number => Number.isFinite(Number(v)) ? Number(v) : 0;
const clean = (v: unknown, fallback = "-") => typeof v === "string" && v.trim() ? v.trim() : fallback;
const trim = (v: unknown, n = 36) => { const s = clean(v, "").replace(/\s+/g, " "); return s.length > n ? s.slice(0, n - 1) + "." : s || "-"; };
const fmt = (v: number) => Math.max(0, Math.round(v)).toLocaleString("en-US");
const cost = (v: number) => "$" + Math.max(0, v).toFixed(v < .01 ? 4 : 3);
const usage = (v: unknown) => { const u = obj(v), c = obj(u.cache); return num(u.input) + num(u.output) + num(u.reasoning) + num(c.read) + num(c.write); };
const latest = (items: readonly any[]) => obj([...items].reverse().find((item) => item?.type === "assistant"));
const gauge = (percent: number) => { const n = Math.max(0, Math.min(16, Math.round(percent * 16 / 100))); return "\u2588".repeat(n) + "\u2591".repeat(16 - n); };

// Sidepanel owns the sidebar. These defaults are persisted per user and
// changed from /sidepanel-settings, never by editing an OpenCode config file.
const DEFAULT_WIDGETS = {
  context: true,
  mcp: true,
  agent: true,
  activity: true,
  workspace: true,
  usage: true,
  subagents: true,
} as const;
type WidgetID = keyof typeof DEFAULT_WIDGETS;
type SidepanelSettings = { widgets: Record<WidgetID, boolean> };
const WIDGET_LABELS: Record<WidgetID, string> = {
  context: "Context",
  mcp: "MCP servers",
  agent: "Agent",
  activity: "Activity",
  workspace: "Workspace",
  usage: "Usage",
  subagents: "Subagents",
};

function Heading(props: { label: string; tone?: string }) { return <text fg={props.tone ?? "cyan"}><b>{props.label.toUpperCase()}</b></text>; }
function Line(props: { label: string; value: string; tone?: string }) { return <box flexDirection="row" justifyContent="space-between" gap={1}><text fg="gray">{props.label}</text><text fg={props.tone ?? "white"} wrapMode="none">{props.value}</text></box>; }

function Agent(props: { ctx: any; id: string }) {
  const session = () => props.ctx.data.session.get(props.id);
  const state = () => props.ctx.data.session.status(props.id);
  const model = () => obj(props.ctx.ui.model.current() ?? session()?.model);
  const busy = () => state() === "running";
  return <box flexDirection="column" gap={0}>
    <Heading label="Agent" tone={busy() ? "yellow" : "green"} />
    <text fg={busy() ? "yellow" : "green"}>{busy() ? "[working]" : "[ready]"}</text>
    <text fg="white">{trim(model().modelID ?? model().id ?? "No model")}</text>
    <text fg="gray">{"Agent - " + clean(session()?.agent, "default")}</text>
    <Show when={model().variant}><text fg="gray">{"Thinking - " + model().variant}</text></Show>
  </box>;
}

function Activity(props: { ctx: any; id: string }) {
  const messages = () => props.ctx.data.session.message.list(props.id) ?? [];
  const tools = createMemo(() => (latest(messages()).content ?? []).filter((part: any) => part?.type === "tool").slice(-3));
  const active = createMemo(() => tools().filter((tool: any) => obj(tool.state).status === "running").length);
  return <box flexDirection="column" gap={0}>
    <Heading label="Activity" tone={active() ? "yellow" : "cyan"} />
    <text fg="gray">{active() ? String(active()) + " tool(s) running" : "Turn ready"}</text>
    <For each={tools()}>{(tool: any) => <text fg={obj(tool.state).status === "error" ? "red" : obj(tool.state).status === "running" ? "yellow" : "gray"}>{(obj(tool.state).status === "running" ? "> " : "  ") + trim(tool.name ?? "tool", 29)}</text>}</For>
  </box>;
}

function estimatePartTokens(part: any): number {
  const value = obj(part);
  if (value.type === "text" || value.type === "reasoning") return Math.ceil(clean(value.text, "").length / 4);
  if (value.type === "tool") {
    const state = obj(value.state);
    const input = state.status === "pending" ? state.raw : state.input;
    const output = state.status === "completed" ? state.output : state.status === "error" ? state.error : "";
    try { return Math.ceil((JSON.stringify(input).length + String(output ?? "").length) / 4); }
    catch { return 0; }
  }
  return 0;
}

function liveContext(messages: readonly any[]): { tokens: number; estimated: boolean } {
  let anchor = -1;
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index]?.type === "assistant" && usage(messages[index]?.tokens) > 0) { anchor = index; break; }
  }
  let total = anchor >= 0 ? usage(messages[anchor]?.tokens) : 0;
  let estimated = anchor < 0;
  for (let index = Math.max(0, anchor + 1); index < messages.length; index++) {
    const message = obj(messages[index]);
    const parts = Array.isArray(message.content) ? message.content : [];
    const userText = typeof message.text === "string" ? Math.ceil(message.text.length / 4) : 0;
    const extra = userText + parts.reduce((sum: number, part: any) => sum + estimatePartTokens(part), 0);
    total += extra;
    estimated ||= extra > 0;
  }
  return { tokens: total, estimated };
}

function Context(props: { ctx: any; id: string }) {
  const session = () => props.ctx.data.session.get(props.id);
  const messages = () => props.ctx.data.session.message.list(props.id) ?? [];
  const model = () => obj(props.ctx.ui.model.current() ?? session()?.model);
  const limit = createMemo(() => {
    const current = model();
    const models = props.ctx.data.location.model.list(session()?.location ?? props.ctx.location) ?? [];
    const hit = models.find((item: any) => item.providerID === current.providerID && (item.modelID === current.modelID || item.id === current.modelID || item.id === current.id));
    return num(hit?.limit?.context);
  });
  const live = createMemo(() => liveContext(messages()));
  const percent = createMemo(() => limit() ? Math.min(100, live().tokens * 100 / limit()) : 0);
  const tone = createMemo(() => percent() >= 90 ? "red" : percent() >= 70 ? "yellow" : "green");
  return <box flexDirection="column" gap={0}>
    <Heading label="Context" tone={tone()} />
    <box flexDirection="row" gap={1}><text fg={tone()}>{gauge(percent())}</text><text fg={tone()}>{limit() ? percent().toFixed(1) + "%" : "-"}</text></box>
    <text fg="gray">{(live().estimated ? "~" : "") + fmt(live().tokens) + " / " + (limit() ? fmt(limit()) : "?") + " tokens"}</text>
    <Show when={live().estimated}><text fg="gray">Live estimate - awaiting reported usage</text></Show>
  </box>;
}

function McpPanel(props: { ctx: any; id: string }) {
  const session = () => props.ctx.data.session.get(props.id);
  const location = () => session()?.location ?? props.ctx.location;
  createEffect(() => { void props.ctx.data.location.mcp.server.sync(location()); });
  const servers = () => props.ctx.data.location.mcp.server.list(location()) ?? [];
  const status = (server: any) => clean(obj(server).status?.status, "pending");
  const tone = (server: any) => {
    switch (status(server)) {
      case "connected": return "green";
      case "failed": return "red";
      case "needs_auth": return "yellow";
      default: return "gray";
    }
  };
  const label = (server: any) => {
    switch (status(server)) {
      case "connected": return "Connected";
      case "failed": return "Error";
      case "needs_auth": return "Auth required";
      case "disabled": return "Disabled";
      default: return "Connecting";
    }
  };
  return <Show when={servers().length > 0}><box flexDirection="column" gap={0}>
    <Heading label="MCP" tone="white" />
    <For each={servers()}>{(server: any) => <box flexDirection="row" justifyContent="space-between" gap={1}>
      <box flexDirection="row">
        <text fg={tone(server)}>{"\u2022"}</text>
        <text fg="white" wrapMode="none">{" " + trim(server.name, 24)}</text>
      </box>
      <text fg={tone(server)} wrapMode="none">{label(server)}</text>
    </box>}</For>
  </box></Show>;
}


function Workspace(props: { ctx: any; id: string }) {
  const session = () => props.ctx.data.session.get(props.id);
  const vcs = () => obj(props.ctx.data.location.vcs.info(session()?.location));
  const branch = () => clean(obj(vcs().branch).current ?? obj(vcs().branch).name, "unknown");
  return <box flexDirection="column" gap={0}>
    <Heading label="Workspace" />
    <text fg="white">{trim(session()?.location?.directory, 38)}</text>
    <text fg="gray">{"Branch - " + branch()}</text>
    <text fg="gray">{"Session - " + trim(session()?.title, 29)}</text>
  </box>;
}

function Usage(props: { ctx: any; id: string }) {
  const session = () => props.ctx.data.session.get(props.id);
  const messages = () => props.ctx.data.session.message.list(props.id) ?? [];
  const totals = createMemo(() => messages().reduce((sum: Any, m: any) => { const u = obj(m.tokens), c = obj(u.cache); return { input: sum.input + num(u.input), output: sum.output + num(u.output), read: sum.read + num(c.read), write: sum.write + num(c.write) }; }, { input: 0, output: 0, read: 0, write: 0 }));
  const rate = createMemo(() => { const total = totals().input + totals().read + totals().write; return total ? totals().read * 100 / total : 0; });
  return <box flexDirection="column" gap={0}>
    <Heading label="Usage" tone="magenta" />
    <text fg="gray">{"In " + fmt(totals().input) + " - Out " + fmt(totals().output)}</text>
    <text fg="gray">{"Cache read " + fmt(totals().read) + " - write " + fmt(totals().write)}</text>
    <text fg="gray">{"Cache hit " + rate().toFixed(1) + "% - Cost " + cost(num(session()?.cost))}</text>
  </box>;
}

function subagentStatus(ctx: any, id: string, saved?: any): { label: string; tone: string; marker: string } {
  const session = saved ?? ctx.data.session.get(id);
  if (ctx.data.session.status(id) === "running") return { label: "Working", tone: "yellow", marker: "\u25d0" };
  switch (session?.outcome) {
    case "succeeded": return { label: "Finished", tone: "green", marker: "\u2713" };
    case "failed": return { label: "Failed", tone: "red", marker: "\u2717" };
    case "interrupted": return { label: "Interrupted", tone: "yellow", marker: "!" };
  }
  if (session?.time?.idle) return { label: "Finished", tone: "green", marker: "\u2713" };
  return { label: "Waiting", tone: "gray", marker: "\u25cb" };
}

function Subagents(props: { ctx: any; id: string; cache: { sessions: Record<string, any> }; refresh: (rootID: string) => void }) {
  const root = () => props.ctx.data.session.root(props.id);
  createEffect(() => { props.refresh(root()); });
  const children = createMemo(() => {
    const rootID = root();
    const known = new Map<string, any>([...props.ctx.data.session.list(), ...Object.values(props.cache.sessions)].map((session: any) => [session.id, session]));
    for (const id of props.ctx.data.session.family(rootID)) {
      const session = props.ctx.data.session.get(id);
      if (session) known.set(id, session);
    }
    const result: string[] = [];
    const parents = [rootID];
    const seen = new Set<string>([rootID]);
    while (parents.length) {
      const parentID = parents.shift()!;
      for (const session of known.values()) {
        if (session.parentID !== parentID || seen.has(session.id)) continue;
        seen.add(session.id);
        result.push(session.id);
        parents.push(session.id);
      }
    }
    return result;
  });
  return <Show when={children().length > 0}><box flexDirection="column" gap={0}>
    <Heading label={"Subagents - " + children().length} tone="green" />
    <For each={children().slice(0, 6)}>{(id: string) => {
      const session = () => props.ctx.data.session.get(id) ?? props.cache.sessions[id];
      const status = () => subagentStatus(props.ctx, id, session());
      const description = () => trim(session()?.title ?? obj(session()?.metadata).description ?? obj(session()?.metadata).task, 34);
      return <box flexDirection="column" gap={0}>
        <box flexDirection="row" justifyContent="space-between" gap={1}>
          <text fg={status().tone} wrapMode="none">{status().marker + " " + clean(session()?.agent, "subagent")}</text>
          <text fg={status().tone} wrapMode="none">{status().label}</text>
        </box>
        <text fg="gray" wrapMode="none">{"  " + description()}</text>
      </box>;
    }}</For>
  </box></Show>;
}

function Sidepanel(props: { ctx: any; id: string; cache: { sessions: Record<string, any> }; refresh: (rootID: string) => void; settings: SidepanelSettings }) { return <box flexDirection="column" gap={1} paddingLeft={1} paddingRight={1}>
  <text fg="cyan"><b>SIDEPANEL</b></text>
  <Show when={props.settings.widgets.context}><Context {...props} /></Show>
  <Show when={props.settings.widgets.mcp}><McpPanel {...props} /></Show>
  <Show when={props.settings.widgets.agent}><Agent {...props} /></Show>
  <Show when={props.settings.widgets.activity}><Activity {...props} /></Show>
  <Show when={props.settings.widgets.workspace}><Workspace {...props} /></Show>
  <Show when={props.settings.widgets.usage}><Usage {...props} /></Show>
  <Show when={props.settings.widgets.subagents}><Subagents {...props} /></Show>
</box>; }

export default Plugin.define({ id: "opencode-sidepanel", setup(ctx) {
  const [settings, updateSettings] = ctx.storage.store<SidepanelSettings>("settings", { initial: { widgets: { ...DEFAULT_WIDGETS } } });
  const configureWidgets = async () => {
    while (true) {
      const widget = await ctx.ui.dialog.select({
        title: "Sidepanel widgets",
        placeholder: "Select a widget to show or hide",
        options: (Object.keys(DEFAULT_WIDGETS) as WidgetID[]).map((id) => ({
          title: WIDGET_LABELS[id] + (settings.widgets[id] ? " - shown" : " - hidden"),
          value: id,
          description: "Select to " + (settings.widgets[id] ? "hide" : "show"),
        })),
      });
      if (!widget) return;
      const id = widget as WidgetID;
      await updateSettings((draft) => { draft.widgets[id] = !draft.widgets[id]; });
    }
  };
  const [subagentCache, setSubagentCache] = ctx.storage.memory<{ sessions: Record<string, any> }>("opencode-sidepanel-subagents", { initial: { sessions: {} } });
  const pending = new Set<string>();
  const loadSubagents = async (parentID: string, depth = 0): Promise<void> => {
    if (depth > 4 || pending.has(parentID)) return;
    pending.add(parentID);
    try {
      const response = await ctx.client.session.list({ parentID, limit: 200, order: "desc" });
      const sessions = response.data ?? [];
      if (sessions.length) setSubagentCache((draft) => { for (const session of sessions) draft.sessions[session.id] = session; });
      await Promise.all(sessions.map((session: any) => loadSubagents(session.id, depth + 1)));
    } catch { /* The live in-memory family remains available if history is unavailable. */ }
    finally { pending.delete(parentID); }
  };
  ctx.keymap.layer(() => ({ mode: "global", commands: [
    { id: "sidepanel.open", title: "Open Sidepanel", group: "Sidepanel", bind: "f6", palette: true, slash: { name: "sidepanel" }, run: () => { ctx.ui.panel.open("opencode-sidepanel"); } },
    { id: "sidepanel.settings", title: "Configure Sidepanel widgets", group: "Sidepanel", palette: true, slash: { name: "sidepanel-settings", aliases: ["sidepanel-config"] }, run: () => { void configureWidgets(); } },
    { id: "sidepanel.sessions.all", title: "Switch session from all locations", group: "Sidepanel", palette: true, slash: { name: "all-sessions", aliases: ["sessions-all"] }, run: async () => { const response = await ctx.client.session.list({ limit: 200 }); const id = await ctx.ui.dialog.select({ title: "All sessions", placeholder: "Search sessions across every location", options: response.data.map((session: any) => ({ title: session.title || "Untitled session", value: session.id, description: session.projectID || "global" })) }); if (id) ctx.ui.router.navigate({ type: "session", sessionID: id }); } },
  ] }));
  const home = ctx.ui.slot({ append: "home.footer.status", render: () => <text>All sessions: /all-sessions</text> });
  const sidebar = ctx.ui.slot({ replace: "sidebar.content", render: ({ sessionID }) => <Sidepanel ctx={ctx} id={sessionID} cache={subagentCache} refresh={loadSubagents} settings={settings} /> });
  const panel = ctx.ui.slot({ append: "session.panel", render: (input) => <Show when={input.name === "opencode-sidepanel"}><Sidepanel ctx={ctx} id={input.sessionID} cache={subagentCache} refresh={loadSubagents} settings={settings} /></Show> });
  return () => { home(); sidebar(); panel(); };
} });
