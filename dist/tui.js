// @bun
// tui.tsx
import { createTextNode as C } from "@opentui/solid";
import { createComponent as A } from "@opentui/solid";
import { memo as P } from "@opentui/solid";
import { setProp as K } from "@opentui/solid";
import { effect as h } from "@opentui/solid";
import { insertNode as F } from "@opentui/solid";
import { insert as B } from "@opentui/solid";
import { createElement as G } from "@opentui/solid";
import { Plugin as u } from "@opencode/plugin/tui";
import { createEffect as v, createMemo as I, For as b, Show as T } from "solid-js";
var k = (q) => q && typeof q === "object" ? q : {}, w = (q) => Number.isFinite(Number(q)) ? Number(q) : 0, f = (q, z = "-") => typeof q === "string" && q.trim() ? q.trim() : z, S = (q, z = 36) => {
  let V = f(q, "").replace(/\s+/g, " ");
  return V.length > z ? V.slice(0, z - 1) + "." : V || "-";
}, j = (q) => Math.max(0, Math.round(q)).toLocaleString("en-US"), d = (q) => "$" + Math.max(0, q).toFixed(q < 0.01 ? 4 : 3), x = (q) => {
  let z = k(q), V = k(z.cache);
  return w(z.input) + w(z.output) + w(z.reasoning) + w(V.read) + w(V.write);
}, m = (q) => k([...q].reverse().find((z) => z?.type === "assistant")), c = (q) => {
  let z = Math.max(0, Math.min(16, Math.round(q * 16 / 100)));
  return "\u2588".repeat(z) + "\u2591".repeat(16 - z);
}, E = {
  context: !0,
  mcp: !0,
  agent: !0,
  activity: !0,
  workspace: !0,
  usage: !0,
  subagents: !0
}, a = {
  context: "Context",
  mcp: "MCP servers",
  agent: "Agent",
  activity: "Activity",
  workspace: "Workspace",
  usage: "Usage",
  subagents: "Subagents"
};
function D(q) {
  return (() => {
    var z = G("text"), V = G("b");
    return F(z, V), B(V, () => q.label.toUpperCase()), h((Q) => K(z, "fg", q.tone ?? "cyan", Q)), z;
  })();
}
function i(q) {
  let z = () => q.ctx.data.session.get(q.id), V = () => q.ctx.data.session.status(q.id), Q = () => k(q.ctx.ui.model.current() ?? z()?.model), O = () => V() === "running";
  return (() => {
    var J = G("box"), Y = G("text"), X = G("text"), R = G("text");
    return F(J, Y), F(J, X), F(J, R), K(J, "flexDirection", "column"), K(J, "gap", 0), B(J, A(D, {
      label: "Agent",
      get tone() {
        return O() ? "yellow" : "green";
      }
    }), Y), B(Y, () => O() ? "[working]" : "[ready]"), K(X, "fg", "white"), B(X, () => S(Q().modelID ?? Q().id ?? "No model")), K(R, "fg", "gray"), B(R, () => "Agent - " + f(z()?.agent, "default")), B(J, A(T, {
      get when() {
        return Q().variant;
      },
      get children() {
        var Z = G("text");
        return K(Z, "fg", "gray"), B(Z, () => "Thinking - " + Q().variant), Z;
      }
    }), null), h((Z) => K(Y, "fg", O() ? "yellow" : "green", Z)), J;
  })();
}
function l(q) {
  let z = () => q.ctx.data.session.message.list(q.id) ?? [], V = I(() => (m(z()).content ?? []).filter((O) => O?.type === "tool").slice(-3)), Q = I(() => V().filter((O) => k(O.state).status === "running").length);
  return (() => {
    var O = G("box"), J = G("text");
    return F(O, J), K(O, "flexDirection", "column"), K(O, "gap", 0), B(O, A(D, {
      label: "Activity",
      get tone() {
        return Q() ? "yellow" : "cyan";
      }
    }), J), K(J, "fg", "gray"), B(J, (() => {
      var Y = P(() => !!Q());
      return () => Y() ? String(Q()) + " tool(s) running" : "Turn ready";
    })()), B(O, A(b, {
      get each() {
        return V();
      },
      children: (Y) => (() => {
        var X = G("text");
        return B(X, () => (k(Y.state).status === "running" ? "> " : "  ") + S(Y.name ?? "tool", 29)), h((R) => K(X, "fg", k(Y.state).status === "error" ? "red" : k(Y.state).status === "running" ? "yellow" : "gray", R)), X;
      })()
    }), null), O;
  })();
}
function n(q) {
  let z = k(q);
  if (z.type === "text" || z.type === "reasoning")
    return Math.ceil(f(z.text, "").length / 4);
  if (z.type === "tool") {
    let V = k(z.state), Q = V.status === "pending" ? V.raw : V.input, O = V.status === "completed" ? V.output : V.status === "error" ? V.error : "";
    try {
      return Math.ceil((JSON.stringify(Q).length + String(O ?? "").length) / 4);
    } catch {
      return 0;
    }
  }
  return 0;
}
function p(q) {
  let z = -1;
  for (let O = q.length - 1;O >= 0; O--)
    if (q[O]?.type === "assistant" && x(q[O]?.tokens) > 0) {
      z = O;
      break;
    }
  let V = z >= 0 ? x(q[z]?.tokens) : 0, Q = z < 0;
  for (let O = Math.max(0, z + 1);O < q.length; O++) {
    let J = k(q[O]), Y = Array.isArray(J.content) ? J.content : [], R = (typeof J.text === "string" ? Math.ceil(J.text.length / 4) : 0) + Y.reduce((Z, y) => Z + n(y), 0);
    V += R, Q ||= R > 0;
  }
  return {
    tokens: V,
    estimated: Q
  };
}
function r(q) {
  let z = () => q.ctx.data.session.get(q.id), V = () => q.ctx.data.session.message.list(q.id) ?? [], Q = () => k(q.ctx.ui.model.current() ?? z()?.model), O = I(() => {
    let R = Q(), y = (q.ctx.data.location.model.list(z()?.location ?? q.ctx.location) ?? []).find((L) => L.providerID === R.providerID && (L.modelID === R.modelID || L.id === R.modelID || L.id === R.id));
    return w(y?.limit?.context);
  }), J = I(() => p(V())), Y = I(() => O() ? Math.min(100, J().tokens * 100 / O()) : 0), X = I(() => Y() >= 90 ? "red" : Y() >= 70 ? "yellow" : "green");
  return (() => {
    var R = G("box"), Z = G("box"), y = G("text"), L = G("text"), W = G("text");
    return F(R, Z), F(R, W), K(R, "flexDirection", "column"), K(R, "gap", 0), B(R, A(D, {
      label: "Context",
      get tone() {
        return X();
      }
    }), Z), F(Z, y), F(Z, L), K(Z, "flexDirection", "row"), K(Z, "gap", 1), B(y, () => c(Y())), B(L, (() => {
      var U = P(() => !!O());
      return () => U() ? Y().toFixed(1) + "%" : "-";
    })()), K(W, "fg", "gray"), B(W, () => (J().estimated ? "~" : "") + j(J().tokens) + " / " + (O() ? j(O()) : "?") + " tokens"), B(R, A(T, {
      get when() {
        return J().estimated;
      },
      get children() {
        var U = G("text");
        return F(U, C("Live estimate - awaiting reported usage")), K(U, "fg", "gray"), U;
      }
    }), null), h((U) => {
      var H = X(), M = X();
      return H !== U.e && (U.e = K(y, "fg", H, U.e)), M !== U.t && (U.t = K(L, "fg", M, U.t)), U;
    }, {
      e: void 0,
      t: void 0
    }), R;
  })();
}
function o(q) {
  let z = () => q.ctx.data.session.get(q.id), V = () => z()?.location ?? q.ctx.location;
  v(() => {
    q.ctx.data.location.mcp.server.sync(V());
  });
  let Q = () => q.ctx.data.location.mcp.server.list(V()) ?? [], O = (X) => f(k(X).status?.status, "pending"), J = (X) => {
    switch (O(X)) {
      case "connected":
        return "green";
      case "failed":
        return "red";
      case "needs_auth":
        return "yellow";
      default:
        return "gray";
    }
  }, Y = (X) => {
    switch (O(X)) {
      case "connected":
        return "Connected";
      case "failed":
        return "Error";
      case "needs_auth":
        return "Auth required";
      case "disabled":
        return "Disabled";
      default:
        return "Connecting";
    }
  };
  return A(T, {
    get when() {
      return Q().length > 0;
    },
    get children() {
      var X = G("box");
      return K(X, "flexDirection", "column"), K(X, "gap", 0), B(X, A(D, {
        label: "MCP",
        tone: "white"
      }), null), B(X, A(b, {
        get each() {
          return Q();
        },
        children: (R) => (() => {
          var Z = G("box"), y = G("box"), L = G("text"), W = G("text"), U = G("text");
          return F(Z, y), F(Z, U), K(Z, "flexDirection", "row"), K(Z, "justifyContent", "space-between"), K(Z, "gap", 1), F(y, L), F(y, W), K(y, "flexDirection", "row"), F(L, C("\u2022")), K(W, "fg", "white"), K(W, "wrapMode", "none"), B(W, () => " " + S(R.name, 24)), K(U, "wrapMode", "none"), B(U, () => Y(R)), h((H) => {
            var M = J(R), N = J(R);
            return M !== H.e && (H.e = K(L, "fg", M, H.e)), N !== H.t && (H.t = K(U, "fg", N, H.t)), H;
          }, {
            e: void 0,
            t: void 0
          }), Z;
        })()
      }), null), X;
    }
  });
}
function $(q) {
  let z = () => q.ctx.data.session.get(q.id), V = () => k(q.ctx.data.location.vcs.info(z()?.location)), Q = () => f(k(V().branch).current ?? k(V().branch).name, "unknown");
  return (() => {
    var O = G("box"), J = G("text"), Y = G("text"), X = G("text");
    return F(O, J), F(O, Y), F(O, X), K(O, "flexDirection", "column"), K(O, "gap", 0), B(O, A(D, {
      label: "Workspace"
    }), J), K(J, "fg", "white"), B(J, () => S(z()?.location?.directory, 38)), K(Y, "fg", "gray"), B(Y, () => "Branch - " + Q()), K(X, "fg", "gray"), B(X, () => "Session - " + S(z()?.title, 29)), O;
  })();
}
function _(q) {
  let z = () => q.ctx.data.session.get(q.id), V = () => q.ctx.data.session.message.list(q.id) ?? [], Q = I(() => V().reduce((J, Y) => {
    let X = k(Y.tokens), R = k(X.cache);
    return {
      input: J.input + w(X.input),
      output: J.output + w(X.output),
      read: J.read + w(R.read),
      write: J.write + w(R.write)
    };
  }, {
    input: 0,
    output: 0,
    read: 0,
    write: 0
  })), O = I(() => {
    let J = Q().input + Q().read + Q().write;
    return J ? Q().read * 100 / J : 0;
  });
  return (() => {
    var J = G("box"), Y = G("text"), X = G("text"), R = G("text");
    return F(J, Y), F(J, X), F(J, R), K(J, "flexDirection", "column"), K(J, "gap", 0), B(J, A(D, {
      label: "Usage",
      tone: "magenta"
    }), Y), K(Y, "fg", "gray"), B(Y, () => "In " + j(Q().input) + " - Out " + j(Q().output)), K(X, "fg", "gray"), B(X, () => "Cache read " + j(Q().read) + " - write " + j(Q().write)), K(R, "fg", "gray"), B(R, () => "Cache hit " + O().toFixed(1) + "% - Cost " + d(w(z()?.cost))), J;
  })();
}
function s(q, z, V) {
  let Q = V ?? q.data.session.get(z);
  if (q.data.session.status(z) === "running")
    return {
      label: "Working",
      tone: "yellow",
      marker: "\u25D0"
    };
  switch (Q?.outcome) {
    case "succeeded":
      return {
        label: "Finished",
        tone: "green",
        marker: "\u2713"
      };
    case "failed":
      return {
        label: "Failed",
        tone: "red",
        marker: "\u2717"
      };
    case "interrupted":
      return {
        label: "Interrupted",
        tone: "yellow",
        marker: "!"
      };
  }
  if (Q?.time?.idle)
    return {
      label: "Finished",
      tone: "green",
      marker: "\u2713"
    };
  return {
    label: "Waiting",
    tone: "gray",
    marker: "\u25CB"
  };
}
function t(q) {
  let z = () => q.ctx.data.session.root(q.id);
  v(() => {
    q.refresh(z());
  });
  let V = I(() => {
    let Q = z(), O = new Map([...q.ctx.data.session.list(), ...Object.values(q.cache.sessions)].map((R) => [R.id, R]));
    for (let R of q.ctx.data.session.family(Q)) {
      let Z = q.ctx.data.session.get(R);
      if (Z)
        O.set(R, Z);
    }
    let J = [], Y = [Q], X = /* @__PURE__ */ new Set([Q]);
    while (Y.length) {
      let R = Y.shift();
      for (let Z of O.values()) {
        if (Z.parentID !== R || X.has(Z.id))
          continue;
        X.add(Z.id), J.push(Z.id), Y.push(Z.id);
      }
    }
    return J;
  });
  return A(T, {
    get when() {
      return V().length > 0;
    },
    get children() {
      var Q = G("box");
      return K(Q, "flexDirection", "column"), K(Q, "gap", 0), B(Q, A(D, {
        get label() {
          return "Subagents - " + V().length;
        },
        tone: "green"
      }), null), B(Q, A(b, {
        get each() {
          return V().slice(0, 6);
        },
        children: (O) => {
          let J = () => q.ctx.data.session.get(O) ?? q.cache.sessions[O], Y = () => s(q.ctx, O, J()), X = () => S(J()?.title ?? k(J()?.metadata).description ?? k(J()?.metadata).task, 34);
          return (() => {
            var R = G("box"), Z = G("box"), y = G("text"), L = G("text"), W = G("text");
            return F(R, Z), F(R, W), K(R, "flexDirection", "column"), K(R, "gap", 0), F(Z, y), F(Z, L), K(Z, "flexDirection", "row"), K(Z, "justifyContent", "space-between"), K(Z, "gap", 1), K(y, "wrapMode", "none"), B(y, () => Y().marker + " " + f(J()?.agent, "subagent")), K(L, "wrapMode", "none"), B(L, () => Y().label), K(W, "fg", "gray"), K(W, "wrapMode", "none"), B(W, () => "  " + X()), h((U) => {
              var H = Y().tone, M = Y().tone;
              return H !== U.e && (U.e = K(y, "fg", H, U.e)), M !== U.t && (U.t = K(L, "fg", M, U.t)), U;
            }, {
              e: void 0,
              t: void 0
            }), R;
          })();
        }
      }), null), Q;
    }
  });
}
function g(q) {
  return (() => {
    var z = G("box"), V = G("text"), Q = G("b");
    return F(z, V), K(z, "flexDirection", "column"), K(z, "gap", 1), K(z, "paddingLeft", 1), K(z, "paddingRight", 1), F(V, Q), K(V, "fg", "cyan"), F(Q, C("SIDEPANEL")), B(z, A(T, {
      get when() {
        return q.settings.widgets.context;
      },
      get children() {
        return A(r, q);
      }
    }), null), B(z, A(T, {
      get when() {
        return q.settings.widgets.mcp;
      },
      get children() {
        return A(o, q);
      }
    }), null), B(z, A(T, {
      get when() {
        return q.settings.widgets.agent;
      },
      get children() {
        return A(i, q);
      }
    }), null), B(z, A(T, {
      get when() {
        return q.settings.widgets.activity;
      },
      get children() {
        return A(l, q);
      }
    }), null), B(z, A(T, {
      get when() {
        return q.settings.widgets.workspace;
      },
      get children() {
        return A($, q);
      }
    }), null), B(z, A(T, {
      get when() {
        return q.settings.widgets.usage;
      },
      get children() {
        return A(_, q);
      }
    }), null), B(z, A(T, {
      get when() {
        return q.settings.widgets.subagents;
      },
      get children() {
        return A(t, q);
      }
    }), null), z;
  })();
}
var Yq = u.define({
  id: "opencode-sidepanel",
  setup(q) {
    let [z, V] = q.storage.store("settings", {
      initial: {
        widgets: {
          ...E
        }
      }
    }), Q = async () => {
      while (!0) {
        let L = await q.ui.dialog.select({
          title: "Sidepanel widgets",
          placeholder: "Select a widget to show or hide",
          options: Object.keys(E).map((U) => ({
            title: a[U] + (z.widgets[U] ? " - shown" : " - hidden"),
            value: U,
            description: "Select to " + (z.widgets[U] ? "hide" : "show")
          }))
        });
        if (!L)
          return;
        let W = L;
        await V((U) => {
          U.widgets[W] = !U.widgets[W];
        });
      }
    }, [O, J] = q.storage.memory("opencode-sidepanel-subagents", {
      initial: {
        sessions: {}
      }
    }), Y = /* @__PURE__ */ new Set, X = async (L, W = 0) => {
      if (W > 4 || Y.has(L))
        return;
      Y.add(L);
      try {
        let H = (await q.client.session.list({
          parentID: L,
          limit: 200,
          order: "desc"
        })).data ?? [];
        if (H.length)
          J((M) => {
            for (let N of H)
              M.sessions[N.id] = N;
          });
        await Promise.all(H.map((M) => X(M.id, W + 1)));
      } catch {} finally {
        Y.delete(L);
      }
    };
    q.keymap.layer(() => ({
      mode: "global",
      commands: [{
        id: "sidepanel.open",
        title: "Open Sidepanel",
        group: "Sidepanel",
        bind: "f6",
        palette: !0,
        slash: {
          name: "sidepanel"
        },
        run: () => {
          q.ui.panel.open("opencode-sidepanel");
        }
      }, {
        id: "sidepanel.settings",
        title: "Configure Sidepanel widgets",
        group: "Sidepanel",
        palette: !0,
        slash: {
          name: "sidepanel-settings",
          aliases: ["sidepanel-config"]
        },
        run: () => {
          Q();
        }
      }, {
        id: "sidepanel.sessions.all",
        title: "Switch session from all locations",
        group: "Sidepanel",
        palette: !0,
        slash: {
          name: "all-sessions",
          aliases: ["sessions-all"]
        },
        run: async () => {
          let L = await q.client.session.list({
            limit: 200
          }), W = await q.ui.dialog.select({
            title: "All sessions",
            placeholder: "Search sessions across every location",
            options: L.data.map((U) => ({
              title: U.title || "Untitled session",
              value: U.id,
              description: U.projectID || "global"
            }))
          });
          if (W)
            q.ui.router.navigate({
              type: "session",
              sessionID: W
            });
        }
      }]
    }));
    let R = q.ui.slot({
      append: "home.footer.status",
      render: () => (() => {
        var L = G("text");
        return F(L, C("All sessions: /all-sessions")), L;
      })()
    }), Z = q.ui.slot({
      replace: "sidebar.content",
      render: ({
        sessionID: L
      }) => A(g, {
        ctx: q,
        id: L,
        cache: O,
        refresh: X,
        settings: z
      })
    }), y = q.ui.slot({
      append: "session.panel",
      render: (L) => A(T, {
        get when() {
          return L.name === "opencode-sidepanel";
        },
        get children() {
          return A(g, {
            ctx: q,
            get id() {
              return L.sessionID;
            },
            cache: O,
            refresh: X,
            settings: z
          });
        }
      })
    });
    return () => {
      R(), Z(), y();
    };
  }
});
export {
  Yq as default
};
