import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("./calendar.js", import.meta.url), "utf8");
function element() {
  return {
    hidden: true, open: true, children: [], listeners: {},
    addEventListener(name, callback) { this.listeners[name] = callback; },
    append(child) { this.children.push(child); this.lastChild = child; },
    replaceChildren(...children) { this.children = children; },
    setAttribute() {},
  };
}
async function browser(fetcher, clockOffset = 0) {
  const elements = new Map();
  const document = {
    documentElement: { lang: "en" },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    createElement: element, addEventListener() {},
  };
  class DeviceDate extends Date {
    static now() { return Date.now() + clockOffset; }
  }
  const calls = [];
  vm.runInNewContext(source, {
    window: { MareLocale: { t: (key) => key } }, document,
    Date: DeviceDate, Intl, performance, AbortController,
    // Deliberately omit AbortSignal.timeout to cover older mobile browsers.
    setTimeout(callback, delay) { if (delay === 500) queueMicrotask(callback); return 1; },
    clearTimeout() {},
    fetch: async (...args) => { calls.push(args); return fetcher(calls.length); },
  });
  await new Promise((resolve) => setImmediate(resolve));
  return { elements, calls };
}
function response(age = 0) {
  return new Response(JSON.stringify({
    blocked: [{ start: "2030-06-10", end: "2030-06-13" }],
    fetchedAt: new Date(Date.now() - age).toISOString(),
  }), { headers: { Date: new Date().toUTCString() } });
}

test("open calendar loads automatically without browser caching or AbortSignal.timeout", async () => {
  const { elements, calls } = await browser(() => response());
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].cache, "no-store");
  assert.equal(elements.get("availability-calendar").hidden, false);
  assert.equal(elements.get("calendar-content").hidden, false);
  assert.ok(elements.get("calendar-days").children.length >= 4);
});

test("one transient failure recovers automatically", async () => {
  const { elements, calls } = await browser((attempt) => attempt === 1
    ? new Response("unavailable", { status: 503 }) : response());
  assert.equal(calls.length, 2);
  assert.equal(elements.get("calendar-content").hidden, false);
  assert.equal(elements.get("calendar-retry").hidden, true);
});

test("fresh server data remains usable when the device clock is incorrect", async () => {
  for (const offset of [-3600000, 3600000]) {
    const { elements } = await browser(() => response(), offset);
    assert.equal(elements.get("calendar-content").hidden, false);
  }
});

test("stale data and repeated failures still show a retry instead of available dates", async () => {
  for (const fetcher of [() => response(660000), () => { throw new Error("offline"); }]) {
    const { elements, calls } = await browser(fetcher);
    assert.equal(calls.length, 2);
    assert.equal(elements.get("calendar-content").hidden, true);
    assert.equal(elements.get("calendar-retry").hidden, false);
    assert.match(elements.get("calendar-status").textContent, /Calendar unavailable/);
  }
});
