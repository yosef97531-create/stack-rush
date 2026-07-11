/**
 * Stack Rush — global leaderboard (Cloudflare Worker + KV)
 * -------------------------------------------------------------------
 * Endpoints:
 *   POST /            body: { name, score, mode }   -> saves a score
 *   GET  /top?mode=X                                -> top 10 for a mode
 *
 * Deploy (free):
 *   1. Create a free Cloudflare account.
 *   2. Dashboard -> Workers & Pages -> KV -> create a namespace (e.g. "stack_rush").
 *   3. Create a Worker, paste this file in.
 *   4. Worker -> Settings -> Variables -> KV Namespace Bindings:
 *        Variable name: LEADERBOARD   ->  your namespace
 *   5. Deploy. Copy the Worker URL (https://stack-rush-lb.YOU.workers.dev)
 *      and paste it into LEADERBOARD_API in index.html.
 *
 * (Prefer the CLI? `npm i -g wrangler`, add a [[kv_namespaces]] binding named
 *  LEADERBOARD in wrangler.toml, then `wrangler deploy`.)
 * -------------------------------------------------------------------
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",              // lock to your domain in prod
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_ENTRIES = 100;   // keep a bit more than 10 so the board stays fresh
const VALID_MODES = new Set(["normal", "daily"]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function cleanName(n) {
  return String(n || "YOU")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3) || "YOU";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    // ---- GET /top?mode=normal ----
    if (request.method === "GET" && url.pathname === "/top") {
      const mode = VALID_MODES.has(url.searchParams.get("mode"))
        ? url.searchParams.get("mode")
        : "normal";
      const list = JSON.parse((await env.LEADERBOARD.get("board:" + mode)) || "[]");
      return json(list.slice(0, 10));
    }

    // ---- POST / {name, score, mode} ----
    if (request.method === "POST") {
      let data;
      try { data = await request.json(); }
      catch { return json({ error: "bad json" }, 400); }

      const score = Math.max(0, Math.min(1_000_000, parseInt(data.score, 10) || 0));
      const name = cleanName(data.name);
      const mode = VALID_MODES.has(data.mode) ? data.mode : "normal";
      if (score <= 0) return json({ error: "invalid score" }, 400);

      const key = "board:" + mode;
      const list = JSON.parse((await env.LEADERBOARD.get(key)) || "[]");
      list.push({ name, score, ts: Date.now() });
      list.sort((a, b) => b.score - a.score);
      const trimmed = list.slice(0, MAX_ENTRIES);
      await env.LEADERBOARD.put(key, JSON.stringify(trimmed));

      const rank = trimmed.findIndex(e => e.name === name && e.score === score);
      return json({ ok: true, rank: rank >= 0 ? rank + 1 : null, top: trimmed.slice(0, 10) });
    }

    return json({ error: "not found" }, 404);
  },
};
