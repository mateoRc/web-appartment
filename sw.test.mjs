import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function worker(fetcher = async () => new Response("fresh")) {
  const handlers = {};
  const values = new Map();
  const deleted = [];
  const pending = [];
  let installed = [];
  let claimed = false;
  const cache = {
    match: async (key) => values.get(key)?.clone(),
    put: async (key, response) => { values.set(key, response); },
    addAll: async (requests) => { installed = requests.map((r) => r.url); },
  };
  class LocalRequest extends Request {
    constructor(url, options) { super(new URL(url, "https://mare.test"), options); }
  }
  vm.runInNewContext(readFileSync(new URL("./sw.js", import.meta.url), "utf8"), {
    self: {
      location: { origin: "https://mare.test" },
      addEventListener: (name, callback) => { handlers[name] = callback; },
      clients: { claim: async () => { claimed = true; } },
    },
    caches: {
      open: async () => cache,
      keys: async () => ["mare-offline-old", "mare-offline-__BUILD_VERSION__", "unrelated-cache"],
      delete: async (key) => { deleted.push(key); },
    },
    Request: LocalRequest, Response, URL, AbortController, setTimeout, clearTimeout, fetch: fetcher,
  });
  return {
    values, deleted,
    get installed() { return installed; },
    get claimed() { return claimed; },
    async lifecycle(name) { await handlers[name]({ waitUntil: (task) => pending.push(task) }); await Promise.all(pending); },
    async request(path, options = {}) {
      let result;
      handlers.fetch({
        request: { url: new URL(path, "https://mare.test").href, method: "GET", mode: "cors", ...options },
        respondWith: (task) => { result = task; }, waitUntil: (task) => pending.push(task),
      });
      const response = await result;
      await Promise.all(pending);
      return response;
    },
  };
}

test("installation saves essential assets but not availability or external maps", async () => {
  const w = worker(); await w.lifecycle("install");
  assert.ok(w.installed.includes("https://mare.test/"));
  assert.ok(w.installed.includes("https://mare.test/offline.js"));
  assert.ok(w.installed.every((url) => url.startsWith("https://mare.test/") && !url.includes("/api/")));
});
test("activation removes only this site's obsolete offline caches", async () => {
  const w = worker(); await w.lifecycle("activate");
  assert.deepEqual(w.deleted, ["mare-offline-old"]);
  assert.equal(w.claimed, true);
});
test("API, external requests and submissions bypass the service worker", async () => {
  const w = worker(() => { throw Error("must not intercept"); });
  for (const path of ["/api/availability", "https://maps.google.com/", "/unknown-page"]) {
    assert.equal(await w.request(path, { mode: "navigate" }), undefined);
  }
  assert.equal(await w.request("/", { method: "POST" }), undefined);
});
test("offline page navigation uses saved home page even with a query string", async () => {
  const w = worker(async () => { throw Error("offline"); });
  w.values.set("/", new Response("saved address"));
  assert.equal(await (await w.request("/?source=home", { mode: "navigate" })).text(), "saved address");
  assert.equal((await w.request("/assets/unseen.jpg")).type, "error");
});
test("online content refreshes the cache and HTTP errors preserve the saved page", async () => {
  const w = worker(); w.values.set("/", new Response("old"));
  assert.equal(await (await w.request("/", { mode: "navigate" })).text(), "fresh");
  assert.equal(await w.values.get("/").text(), "fresh");
  const failed = worker(async () => new Response("down", { status: 503 }));
  failed.values.set("/", new Response("saved address"));
  assert.equal(await (await failed.request("/", { mode: "navigate" })).text(), "saved address");
});
