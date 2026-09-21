import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { parseCalendar } from "./ical.mjs";
import { availability } from "./index.mjs";

globalThis.crypto ??= webcrypto;
const calendar = (...events) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events.join("\r\n")}\r\nEND:VCALENDAR`;
const event = (start, end, extra = "") => `BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\n${extra}\r\nEND:VEVENT`;
const feed = calendar(event("20300610", "20300613", "SUMMARY:Guest private name\r\nUID:private-reservation"));
const request = new Request("https://example.com/api/availability");
const env = { BOOKING_ICAL_URL: "https://ical.booking.com/v1/export?t=private-token" };
const ctx = { waitUntil: () => {} };

test("checkout is exclusive, overlapping/adjacent blocks merge and private data is stripped", () => {
  assert.deepEqual(parseCalendar(calendar(
    event("20300612", "20300615"), event("20300610", "20300613", "SUMMARY:Private\r\n details"),
    event("20300615", "20300616"), event("20300701", "20300702"),
  )), [{ start: "2030-06-10", end: "2030-06-16" }, { start: "2030-07-01", end: "2030-07-02" }]);
});
test("cancelled and transparent events do not block nights", () => {
  assert.deepEqual(parseCalendar(calendar(event("20300610", "20300613", "STATUS:CANCELLED"),
    event("20300610", "20300613", "TRANSP:TRANSPARENT"))), []);
  assert.deepEqual(parseCalendar(calendar()), []);
});
test("malformed dates, recurrence, timed events and incomplete feeds fail closed", () => {
  for (const source of ["<html>Login</html>", calendar(event("20300230", "20300302")),
    calendar(event("20300610", "20300609")), calendar(event("20300610", "20300613", "RRULE:FREQ=YEARLY")),
    calendar(event("20300610T120000Z", "20300613T120000Z")), "BEGIN:VCALENDAR\nBEGIN:VEVENT\nEND:VCALENDAR",
    calendar("END:VEVENT"), calendar("BEGIN:VEVENT\nDTSTART;VALUE=DATE:20300610\nEND:VEVENT")]) {
    assert.throws(() => parseCalendar(source));
  }
});
test("API exposes only date ranges and fetch timestamp", async () => {
  const response = await availability(request, env, ctx, { fetch: async () => new Response(feed) });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(Object.keys(body).sort(), ["blocked", "fetchedAt"]);
  assert.deepEqual(body.blocked, [{ start: "2030-06-10", end: "2030-06-13" }]);
  assert.ok(!JSON.stringify(body).includes("private"));
});
test("missing secrets, wrong hosts, upstream failures and invalid payloads stay unavailable", async () => {
  for (const url of [undefined, "http://ical.booking.com/a", "https://booking.com.evil.example/a"]) {
    const response = await availability(request, { BOOKING_ICAL_URL: url }, ctx, { fetch: () => { throw Error("must not fetch"); } });
    assert.equal(response.status, 503);
  }
  for (const fetcher of [async () => new Response("no", { status: 500 }), async () => new Response("bad"),
    async () => new Response("x".repeat(512 * 1024 + 1)), async () => { throw Error(env.BOOKING_ICAL_URL); }]) {
    const response = await availability(request, env, ctx, { fetch: fetcher });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const body = await response.json();
    assert.equal(body.error, "availability_unavailable");
    assert.ok(body.reason);
    assert.ok(!JSON.stringify(body).includes("private-token"));
  }
});
test("cache reuse avoids upstream fetches and secret changes invalidate cached dates", async () => {
  const values = new Map();
  let calls = 0;
  const services = {
    fetch: async () => { calls++; return new Response(feed); },
    cache: { match: async (key) => values.get(key.url)?.clone(), put: async (key, value) => { values.set(key.url, value); } },
  };
  await availability(request, env, ctx, services);
  await availability(new Request(`${request.url}?random=1`), env, ctx, services);
  assert.equal(calls, 1);
  await availability(request, { BOOKING_ICAL_URL: `${env.BOOKING_ICAL_URL}2` }, ctx, services);
  assert.equal(calls, 2);
});
test("API refuses writes", async () => {
  assert.equal((await availability(new Request(request.url, { method: "POST" }), env, ctx)).status, 405);
});
test("safe diagnostics distinguish configuration, HTTP and date-format failures", async () => {
  const missing = await availability(request, {}, ctx);
  assert.equal((await missing.json()).reason, "missing_feed_secret");
  const denied = await availability(request, env, ctx, { fetch: async () => new Response("private content", { status: 403 }) });
  assert.deepEqual(await denied.json(), { error: "availability_unavailable", reason: "feed_http_error", upstreamStatus: 403 });
  const timed = await availability(request, env, ctx, { fetch: async () => new Response(calendar(event("20300610T000000Z", "20300613T000000Z"))) });
  assert.equal((await timed.json()).reason, "unsupported_date_format");
});
test("cache lookup failure falls back to the live feed", async () => {
  const response = await availability(request, env, ctx, {
    fetch: async () => new Response(feed),
    cache: { match: async () => { throw Error("cache down"); }, put: async () => {} },
  });
  assert.equal(response.status, 200);
});
test("follows relative and HTTPS Booking.com redirects with one shared timeout", async () => {
  const calls = [];
  const response = await availability(request, env, ctx, { fetch: async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return new Response(null, { status: 302, headers: { Location: "/v2/export?t=private-token" } });
    if (calls.length === 2) return new Response(null, { status: 307, headers: { Location: "https://ical.booking.com/final" } });
    return new Response(feed);
  } });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 3);
  assert.equal(calls[1].url, "https://ical.booking.com/v2/export?t=private-token");
  assert.ok(calls.every(({ options }) => options.redirect === "manual" && options.signal === calls[0].options.signal));
});
test("rejects redirects outside Booking.com and loops without leaking their URLs", async () => {
  for (const location of ["https://example.com/private-token", "http://ical.booking.com/private-token", "https://booking.com.evil.test/private-token"]) {
    let calls = 0;
    const response = await availability(request, env, ctx, { fetch: async () => {
      calls++; return new Response(null, { status: 302, headers: { Location: location } });
    } });
    assert.equal(calls, 1);
    const body = await response.json();
    assert.equal(body.reason, "feed_redirect_not_allowed");
    assert.ok(!JSON.stringify(body).includes("private-token"));
  }
  const response = await availability(request, env, ctx, { fetch: async () => new Response(null, { status: 302, headers: { Location: "/loop" } }) });
  assert.equal((await response.json()).reason, "feed_redirect_limit");
});
test("distinguishes timeouts, connection failures and interrupted response bodies", async () => {
  for (const [name, reason] of [["TimeoutError", "feed_timeout"], ["TypeError", "feed_connection_failed"]]) {
    const response = await availability(request, env, ctx, { fetch: async () => { const error = new Error("private-token"); error.name = name; throw error; } });
    assert.equal((await response.json()).reason, reason);
  }
  const response = await availability(request, env, ctx, { fetch: async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error("private-token")); } })) });
  assert.equal((await response.json()).reason, "feed_read_failed");
});
