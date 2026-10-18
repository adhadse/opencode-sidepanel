// @bun
// tui.tsx
import { createTextNode as C } from "@opentui/solid";
import { createComponent as U } from "@opentui/solid";
import { memo as P } from "@opentui/solid";
import { setProp as K } from "@opentui/solid";
import { effect as h } from "@opentui/solid";
import { insertNode as F } from "@opentui/solid";
import { insert as Y } from "@opentui/solid";
import { createElement as Z } from "@opentui/solid";
import { Plugin as u } from "@opencode/plugin/tui";
import { createEffect as v, createMemo as w, For as b, Show as M } from "solid-js";
var G = (q) => q && typeof q === "object" ? q : {}, T = (q) => Number.isFinite(Number(q)) ? Number(q) : 0, N = (q, z = "-") => typeof q === "string" && q.trim() ? q.trim() : z, f = (q, z = 36) => {
  let Q = N(q, "").replace(/\s+/g, " ");
  return Q.length > z ? Q.slice(0, z - 1) + "." : Q || "-";
}, S = (q) => Math.max(0, Math.round(q)).toLocaleString("en-US"), d = (q) => "$" + Math.max(0, q).toFixed(q < 0.01 ? 4 : 3), g = (q) => {
  let z = G(q), Q = G(z.cache);
  return T(z.input) + T(z.output) + T(z.reasoning) + T(Q.read) + T(Q.write);
}, m = (q) => G([...q].reverse().find((z) => z?.type === "assistant")), c = (q) => {
  let z = Math.max(0, Math.min(16, Math.round(q * 16 / 100)));
  return "\u2588".repeat(z) + "\u2591".repeat(16 - z);
}, D = {
  context: !0,
  mcp: !0,
  agent: !0,
  activity: !0,
  workspace: !0,
  usage: !0,
  subagents: !0
};
function I(q) {
  return (() => {
    var z = Z("text"), Q = Z("b");
    return F(z, Q), Y(Q, () => q.label.toUpperCase()), h((O) => K(z, "fg", q.tone ?? "cyan", O)), z;
  })();
}
function a(q) {
  let z = () => q.ctx.data.session.get(q.id), Q = () => q.ctx.data.session.status(q.id), O = () => G(q.ctx.ui.model.current() ?? z()?.model), L = () => Q() === "running";
  return (() => {
    var J = Z("box"), X = Z("text"), V = Z("text"), B = Z("text");
    return F(J, X), F(J, V), F(J, B), K(J, "flexDirection", "column"), K(J, "gap", 0), Y(J, U(I, {
      label: "Agent",
      get tone() {
        return L() ? "yellow" : "green";
      }
    }), X), Y(X, () => L() ? "[working]" : "[ready]"), K(V, "fg", "white"), Y(V, () => f(O().modelID ?? O().id ?? "No model")), K(B, "fg", "gray"), Y(B, () => "Agent - " + N(z()?.agent, "default")), Y(J, U(M, {
      get when() {
        return O().variant;
      },
      get children() {
        var R = Z("text");
        return K(R, "fg", "gray"), Y(R, () => "Thinking - " + O().variant), R;
      }
    }), null), h((R) => K(X, "fg", L() ? "yellow" : "green", R)), J;
  })();
}
function i(q) {
  let z = () => q.ctx.data.session.message.list(q.id) ?? [], Q = w(() => (m(z()).content ?? []).filter((L) => L?.type === "tool").slice(-3)), O = w(() => Q().filter((L) => G(L.state).status === "running").length);
  return (() => {
    var L = Z("box"), J = Z("text");
    return F(L, J), K(L, "flexDirection", "column"), K(L, "gap", 0), Y(L, U(I, {
      label: "Activity",
      get tone() {
        return O() ? "yellow" : "cyan";
      }
    }), J), K(J, "fg", "gray"), Y(J, (() => {
      var X = P(() => !!O());
      return () => X() ? String(O()) + " tool(s) running" : "Turn ready";
    })()), Y(L, U(b, {
      get each() {
        return Q();
      },
      children: (X) => (() => {
        var V = Z("text");
        return Y(V, () => (G(X.state).status === "running" ? "> " : "  ") + f(X.name ?? "tool", 29)), h((B) => K(V, "fg", G(X.state).status === "error" ? "red" : G(X.state).status === "running" ? "yellow" : "gray", B)), V;
      })()
    }), null), L;
  })();
}
function l(q) {
  let z = G(q);
  if (z.type === "text" || z.type === "reasoning")
    return Math.ceil(N(z.text, "").length / 4);
  if (z.type === "tool") {
    let Q = G(z.state), O = Q.status === "pending" ? Q.raw : Q.input, L = Q.status === "completed" ? Q.output : Q.status === "error" ? Q.error : "";
    try {
      return Math.ceil((JSON.stringify(O).length + String(L ?? "").length) / 4);
    } catch {
      return 0;
    }
  }
  return 0;
}
function n(q) {
  let z = -1;
  for (let L = q.length - 1;L >= 0; L--)
    if (q[L]?.type === "assistant" && g(q[L]?.tokens) > 0) {
      z = L;
      break;
    }
  let Q = z >= 0 ? g(q[z]?.tokens) : 0, O = z < 0;
  for (let L = Math.max(0, z + 1);L < q.length; L++) {
    let J = G(q[L]), X = Array.isArray(J.content) ? J.content : [], B = (typeof J.text === "string" ? Math.ceil(J.text.length / 4) : 0) + X.reduce((R, k) => R + l(k), 0);
    Q += B, O ||= B > 0;
  }
  return {
    tokens: Q,
    estimated: O
  };
}
function p(q) {
  let z = () => q.ctx.data.session.get(q.id), Q = () => q.ctx.data.session.message.list(q.id) ?? [], O = () => G(q.ctx.ui.model.current() ?? z()?.model), L = w(() => {
    let B = O(), k = (q.ctx.data.location.model.list(z()?.location ?? q.ctx.location) ?? []).find((y) => y.providerID === B.providerID && (y.modelID === B.modelID || y.id === B.modelID || y.id === B.id));
    return T(k?.limit?.context);
  }), J = w(() => n(Q())), X = w(() => L() ? Math.min(100, J().tokens * 100 / L()) : 0), V = w(() => X() >= 90 ? "red" : X() >= 70 ? "yellow" : "green");
  return (() => {
    var B = Z("box"), R = Z("box"), k = Z("text"), y = Z("text"), H = Z("text");
    return F(B, R), F(B, H), K(B, "flexDirection", "column"), K(B, "gap", 0), Y(B, U(I, {
      label: "Context",
      get tone() {
        return V();
      }
    }), R), F(R, k), F(R, y), K(R, "flexDirection", "row"), K(R, "gap", 1), Y(k, () => c(X())), Y(y, (() => {
      var A = P(() => !!L());
      return () => A() ? X().toFixed(1) + "%" : "-";
    })()), K(H, "fg", "gray"), Y(H, () => (J().estimated ? "~" : "") + S(J().tokens) + " / " + (L() ? S(L()) : "?") + " tokens"), Y(B, U(M, {
      get when() {
        return J().estimated;
      },
      get children() {
        var A = Z("text");
        return F(A, C("Live estimate - awaiting reported usage")), K(A, "fg", "gray"), A;
      }
    }), null), h((A) => {
      var W = V(), j = V();
      return W !== A.e && (A.e = K(k, "fg", W, A.e)), j !== A.t && (A.t = K(y, "fg", j, A.t)), A;
    }, {
      e: void 0,
      t: void 0
    }), B;
  })();
}
function r(q) {
  let z = () => q.ctx.data.session.get(q.id), Q = () => z()?.location ?? q.ctx.location;
  v(() => {
    q.ctx.data.location.mcp.server.sync(Q());
  });
  let O = () => q.ctx.data.location.mcp.server.list(Q()) ?? [], L = (V) => N(G(V).status?.status, "pending"), J = (V) => {
    switch (L(V)) {
      case "connected":
        return "green";
      case "failed":
        return "red";
      case "needs_auth":
        return "yellow";
      default:
        return "gray";
    }
  }, X = (V) => {
    switch (L(V)) {
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
  return U(M, {
    get when() {
      return O().length > 0;
    },
    get children() {
      var V = Z("box");
      return K(V, "flexDirection", "column"), K(V, "gap", 0), Y(V, U(I, {
        label: "MCP",
        tone: "white"
      }), null), Y(V, U(b, {
        get each() {
          return O();
        },
        children: (B) => (() => {
          var R = Z("box"), k = Z("box"), y = Z("text"), H = Z("text"), A = Z("text");
          return F(R, k), F(R, A), K(R, "flexDirection", "row"), K(R, "justifyContent", "space-between"), K(R, "gap", 1), F(k, y), F(k, H), K(k, "flexDirection", "row"), F(y, C("\u2022")), K(H, "fg", "white"), K(H, "wrapMode", "none"), Y(H, () => " " + f(B.name, 24)), K(A, "wrapMode", "none"), Y(A, () => X(B)), h((W) => {
            var j = J(B), x = J(B);
            return j !== W.e && (W.e = K(y, "fg", j, W.e)), x !== W.t && (W.t = K(A, "fg", x, W.t)), W;
          }, {
            e: void 0,
            t: void 0
          }), R;
        })()
      }), null), V;
    }
  });
}
function o(q) {
  let z = () => q.ctx.data.session.get(q.id), Q = () => G(q.ctx.data.location.vcs.info(z()?.location)), O = () => N(G(Q().branch).current ?? G(Q().branch).name, "unknown");
  return (() => {
    var L = Z("box"), J = Z("text"), X = Z("text"), V = Z("text");
    return F(L, J), F(L, X), F(L, V), K(L, "flexDirection", "column"), K(L, "gap", 0), Y(L, U(I, {
      label: "Workspace"
    }), J), K(J, "fg", "white"), Y(J, () => f(z()?.location?.directory, 38)), K(X, "fg", "gray"), Y(X, () => "Branch - " + O()), K(V, "fg", "gray"), Y(V, () => "Session - " + f(z()?.title, 29)), L;
  })();
}
function $(q) {
  let z = () => q.ctx.data.session.get(q.id), Q = () => q.ctx.data.session.message.list(q.id) ?? [], O = w(() => Q().reduce((J, X) => {
    let V = G(X.tokens), B = G(V.cache);
    return {
      input: J.input + T(V.input),
      output: J.output + T(V.output),
      read: J.read + T(B.read),
      write: J.write + T(B.write)
    };
  }, {
    input: 0,
    output: 0,
    read: 0,
    write: 0
  })), L = w(() => {
    let J = O().input + O().read + O().write;
    return J ? O().read * 100 / J : 0;
  });
  return (() => {
    var J = Z("box"), X = Z("text"), V = Z("text"), B = Z("text");
    return F(J, X), F(J, V), F(J, B), K(J, "flexDirection", "column"), K(J, "gap", 0), Y(J, U(I, {
      label: "Usage",
      tone: "magenta"
    }), X), K(X, "fg", "gray"), Y(X, () => "In " + S(O().input) + " - Out " + S(O().output)), K(V, "fg", "gray"), Y(V, () => "Cache read " + S(O().read) + " - write " + S(O().write)), K(B, "fg", "gray"), Y(B, () => "Cache hit " + L().toFixed(1) + "% - Cost " + d(T(z()?.cost))), J;
  })();
}
function _(q, z, Q) {
  let O = Q ?? q.data.session.get(z);
  if (q.data.session.status(z) === "running")
    return {
      label: "Working",
      tone: "yellow",
      marker: "\u25D0"
    };
  switch (O?.outcome) {
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
  if (O?.time?.idle)
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
function s(q) {
  let z = () => q.ctx.data.session.root(q.id);
  v(() => {
    q.refresh(z());
  });
  let Q = w(() => {
    let O = z(), L = new Map([...q.ctx.data.session.list(), ...Object.values(q.cache.sessions)].map((B) => [B.id, B]));
    for (let B of q.ctx.data.session.family(O)) {
      let R = q.ctx.data.session.get(B);
      if (R)
        L.set(B, R);
    }
    let J = [], X = [O], V = /* @__PURE__ */ new Set([O]);
    while (X.length) {
      let B = X.shift();
      for (let R of L.values()) {
        if (R.parentID !== B || V.has(R.id))
          continue;
        V.add(R.id), J.push(R.id), X.push(R.id);
      }
    }
    return J;
  });
  return U(M, {
    get when() {
      return Q().length > 0;
    },
    get children() {
      var O = Z("box");
      return K(O, "flexDirection", "column"), K(O, "gap", 0), Y(O, U(I, {
        get label() {
          return "Subagents - " + Q().length;
        },
        tone: "green"
      }), null), Y(O, U(b, {
        get each() {
          return Q().slice(0, 6);
        },
        children: (L) => {
          let J = () => q.ctx.data.session.get(L) ?? q.cache.sessions[L], X = () => _(q.ctx, L, J()), V = () => f(J()?.title ?? G(J()?.metadata).description ?? G(J()?.metadata).task, 34);
          return (() => {
            var B = Z("box"), R = Z("box"), k = Z("text"), y = Z("text"), H = Z("text");
            return F(B, R), F(B, H), K(B, "flexDirection", "column"), K(B, "gap", 0), F(R, k), F(R, y), K(R, "flexDirection", "row"), K(R, "justifyContent", "space-between"), K(R, "gap", 1), K(k, "wrapMode", "none"), Y(k, () => X().marker + " " + N(J()?.agent, "subagent")), K(y, "wrapMode", "none"), Y(y, () => X().label), K(H, "fg", "gray"), K(H, "wrapMode", "none"), Y(H, () => "  " + V()), h((A) => {
              var W = X().tone, j = X().tone;
              return W !== A.e && (A.e = K(k, "fg", W, A.e)), j !== A.t && (A.t = K(y, "fg", j, A.t)), A;
            }, {
              e: void 0,
              t: void 0
            }), B;
          })();
        }
      }), null), O;
    }
  });
}
function E(q) {
  return (() => {
    var z = Z("box"), Q = Z("text"), O = Z("b");
    return F(z, Q), K(z, "flexDirection", "column"), K(z, "gap", 1), K(z, "paddingLeft", 1), K(z, "paddingRight", 1), F(Q, O), K(Q, "fg", "cyan"), F(O, C("SIDEPANEL")), Y(z, U(M, {
      get when() {
        return D.context;
      },
      get children() {
        return U(p, q);
      }
    }), null), Y(z, U(M, {
      get when() {
        return D.mcp;
      },
      get children() {
        return U(r, q);
      }
    }), null), Y(z, U(M, {
      get when() {
        return D.agent;
      },
      get children() {
        return U(a, q);
      }
    }), null), Y(z, U(M, {
      get when() {
        return D.activity;
      },
      get children() {
        return U(i, q);
      }
    }), null), Y(z, U(M, {
      get when() {
        return D.workspace;
      },
      get children() {
        return U(o, q);
      }
    }), null), Y(z, U(M, {
      get when() {
        return D.usage;
      },
      get children() {
        return U($, q);
      }
    }), null), Y(z, U(M, {
      get when() {
        return D.subagents;
      },
      get children() {
        return U(s, q);
      }
    }), null), z;
  })();
}
var Rq = u.define({
  id: "opencode-sidepanel",
  setup(q) {
    let [z, Q] = q.storage.memory("opencode-sidepanel-subagents", {
      initial: {
        sessions: {}
      }
    }), O = /* @__PURE__ */ new Set, L = async (B, R = 0) => {
      if (R > 4 || O.has(B))
        return;
      O.add(B);
      try {
        let y = (await q.client.session.list({
          parentID: B,
          limit: 200,
          order: "desc"
        })).data ?? [];
        if (y.length)
          Q((H) => {
            for (let A of y)
              H.sessions[A.id] = A;
          });
        await Promise.all(y.map((H) => L(H.id, R + 1)));
      } catch {} finally {
        O.delete(B);
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
        id: "sidepanel.sessions.all",
        title: "Switch session from all locations",
        group: "Sidepanel",
        palette: !0,
        slash: {
          name: "all-sessions",
          aliases: ["sessions-all"]
        },
        run: async () => {
          let B = await q.client.session.list({
            limit: 200
          }), R = await q.ui.dialog.select({
            title: "All sessions",
            placeholder: "Search sessions across every location",
            options: B.data.map((k) => ({
              title: k.title || "Untitled session",
              value: k.id,
              description: k.projectID || "global"
            }))
          });
          if (R)
            q.ui.router.navigate({
              type: "session",
              sessionID: R
            });
        }
      }]
    }));
    let J = q.ui.slot({
      append: "home.footer.status",
      render: () => (() => {
        var B = Z("text");
        return F(B, C("All sessions: /all-sessions")), B;
      })()
    }), X = q.ui.slot({
      replace: "sidebar.content",
      render: ({
        sessionID: B
      }) => U(E, {
        ctx: q,
        id: B,
        cache: z,
        refresh: L
      })
    }), V = q.ui.slot({
      append: "session.panel",
      render: (B) => U(M, {
        get when() {
          return B.name === "opencode-sidepanel";
        },
        get children() {
          return U(E, {
            ctx: q,
            get id() {
              return B.sessionID;
            },
            cache: z,
            refresh: L
          });
        }
      })
    });
    return () => {
      J(), X(), V();
    };
  }
});
export {
  Rq as default
};
