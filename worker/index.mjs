import { parseCalendar } from "./ical.mjs";

const MAX_BYTES = 512 * 1024;
const CACHE_SECONDS = 300;
const isBookingUrl = (url) => url.protocol === "https:" && !url.username && !url.password && !url.port &&
  (url.hostname === "booking.com" || url.hostname.endsWith(".booking.com"));
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
  let reason = "missing_feed_secret";
  let upstreamStatus;
  let requestSignal;
  try {
    if (!env.BOOKING_ICAL_URL?.trim()) throw new Error("Missing source");
    reason = "invalid_feed_url";
    const feed = new URL(env.BOOKING_ICAL_URL);
    if (!isBookingUrl(feed)) {
      throw new Error("Invalid source");
    }
    const cache = services.cache ?? globalThis.caches?.default;
    // A source-specific hash prevents old cached dates surviving a secret change.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(feed.href));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const key = new Request(`${new URL(request.url).origin}/api/availability?source=${hash}`);
    // Cache failures should not prevent us from reading the actual calendar.
    const cached = await cache?.match(key).catch(() => undefined);
    if (cached) {
      try {
        const age = Date.now() - Date.parse((await cached.clone().json()).fetchedAt);
        // Do not rely solely on the edge cache's expiry metadata.
        if (cached.ok && Number.isFinite(age) && age >= -60000 && age < CACHE_SECONDS * 1000) return cached;
      } catch {
        // Corrupt cache entries must also fall back to the live feed.
      }
    }
    reason = "feed_request_failed";
    requestSignal = AbortSignal.timeout(8000);
    let target = feed;
    let upstream;
    for (let redirects = 0; ; redirects++) {
      reason = "feed_request_failed";
      upstream = await (services.fetch ?? fetch)(target.href, {
        headers: { Accept: "text/calendar" },
        redirect: "manual",
        signal: requestSignal,
      });
      if (![301, 302, 303, 307, 308].includes(upstream.status)) break;
      const location = upstream.headers.get("Location");
      await upstream.body?.cancel();
      reason = "feed_redirect_invalid";
      if (!location) throw new Error("Missing redirect");
      if (redirects >= 3) { reason = "feed_redirect_limit"; throw new Error("Too many redirects"); }
      const destination = new URL(location, target);
      if (!isBookingUrl(destination)) {
        reason = "feed_redirect_not_allowed";
        throw new Error("Redirect outside Booking.com");
      }
      target = destination;
    }
    if (!upstream.ok || !upstream.body) {
      reason = "feed_http_error";
      upstreamStatus = upstream.status;
      throw new Error("Calendar unavailable");
    }
    reason = "feed_read_failed";
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { reason = "feed_too_large"; await reader.cancel(); throw new Error("Calendar too large"); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    reason = "invalid_calendar";
    let blocked;
    try {
      blocked = parseCalendar(text);
    } catch (error) {
      // These are fixed parser messages, never arbitrary upstream content.
      if (error.message === "Unsupported date") reason = "unsupported_date_format";
      else if (error.message === "Unsupported event") reason = "unsupported_recurring_event";
      else if (error.message === "Invalid date" || error.message === "Invalid interval") reason = "invalid_calendar_dates";
      throw error;
    }
    // Never expose feed URLs, event titles, reservation IDs or guest details.
    const response = json({ blocked, fetchedAt: new Date().toISOString() }, 200,
      `public, max-age=0, s-maxage=${CACHE_SECONDS}`);
    if (cache) ctx.waitUntil(cache.put(key, response.clone()).catch(() => {}));
    return response;
  } catch (error) {
    if (["feed_request_failed", "feed_read_failed"].includes(reason)) {
      if (requestSignal?.aborted || ["TimeoutError", "AbortError"].includes(error.name)) reason = "feed_timeout";
      else if (reason === "feed_request_failed") reason = "feed_connection_failed";
    }
    // Never log the upstream exception: it could contain the private feed URL.
    return json({ error: "availability_unavailable", reason, ...(upstreamStatus ? { upstreamStatus } : {}) }, 503);
  }
}

export default {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname === "/api/availability") return availability(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
