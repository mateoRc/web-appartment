import { parseCalendar } from "./ical.mjs";

const MAX_BYTES = 512 * 1024;
const CACHE_SECONDS = 300;
const json = (data, status = 200, cache = "no-store") => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
  },
});

export async function availability(request, env, ctx, services = {}) {
  if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
  try {
    const feed = new URL(env.BOOKING_ICAL_URL);
    if (feed.protocol !== "https:" || feed.username || feed.password || feed.port ||
        !(feed.hostname === "booking.com" || feed.hostname.endsWith(".booking.com"))) {
      throw new Error("Invalid source");
    }
    const cache = services.cache ?? globalThis.caches?.default;
    // A source-specific hash prevents old cached dates surviving a secret change.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(feed.href));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const key = new Request(`${new URL(request.url).origin}/api/availability?source=${hash}`);
    const cached = await cache?.match(key);
    if (cached) return cached;
    const upstream = await (services.fetch ?? fetch)(feed.href, {
      headers: { Accept: "text/calendar" },
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok || !upstream.body) throw new Error("Calendar unavailable");
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error("Calendar too large"); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const blocked = parseCalendar(text);
    // Never expose feed URLs, event titles, reservation IDs or guest details.
    const response = json({ blocked, fetchedAt: new Date().toISOString() }, 200,
      `public, max-age=0, s-maxage=${CACHE_SECONDS}`);
    if (cache) ctx.waitUntil(cache.put(key, response.clone()).catch(() => {}));
    return response;
  } catch {
    // Never log the upstream exception: it could contain the private feed URL.
    return json({ error: "availability_unavailable" }, 503);
  }
}

export default {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname === "/api/availability") return availability(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
