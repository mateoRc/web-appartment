# Mare Beachfront Apartment

A responsive static single-page website at Obala Maršala Tita 29, 52221 Rabac, Croatia, with a small Cloudflare Worker for the optional availability calendar. No JavaScript dependencies.

## Run locally in Docker

Run `docker compose up -d` and open http://localhost:8081. Nginx serves files through read-only mounts, so edits appear on refresh without rebuilding. The port is bound to the local machine only. Use `docker compose ps` for status, `docker compose logs web` for logs, and `docker compose down` to stop.

Alternatively, open `index.html` directly. Google Maps and Google Fonts require an internet connection.

## Before publishing

Cloudflare Workers deployment is configured in `wrangler.jsonc`. Set the dashboard build command to `node build.mjs`, deploy command to `npx wrangler deploy`, and version command to `npx wrangler versions upload`. Keep production branch `main` and root `/`. Commit and push the configuration and build script before triggering a new deployment. The build copies only the website files to `dist`; never use the repository root as the assets directory.

- Owner contacts are configured: WhatsApp/phone `+385 98 170 0612`, email `marizahm305@gmail.com`. Update `CONTACT` in `script.js` and the HTML fallback links together when changing them.
- The terrace leads the page. The six-photo gallery includes the kitchen, living room, both bedrooms, beach view and hallway last. It uses one horizontal photo strip on every screen size, with swipe/trackpad scrolling, arrow controls and a photo counter. Two upscaled historical images appear separately in the heritage section, served from `assets`; originals remain in `historical`.
- Availability buttons open the owner's WhatsApp chat. The form validates dates and opens WhatsApp with the guest's name, dates, optional email and message prefilled. Guests review and send the message themselves. A visible continuation link is provided if a browser blocks the new tab.
- Confirm amenities and third-party platform availability with the owner. The Google Maps embed and directions link use the supplied full address; check Google's marker against the entrance before publishing.
- Add the final domain's canonical URL and absolute Open Graph image URL when deployed.

## Photography advice

The terrace is the strongest lead photo because it shows the actual waterfront setting. For a sharper desktop hero, supply a landscape original at least 2000 pixels wide (the current image is 1024 × 683). Brighter interior photos in soft daylight, with straight verticals and consistent lighting, would improve the presentation.

Google Fonts provides DM Sans and Manrope; system font fallbacks keep the page usable offline. Photos are served locally. The hero is eagerly loaded and gallery photos are lazy loaded. Navigation and content remain available without JavaScript. Gallery supports keyboard navigation, Escape, modal focus containment, and reduced motion preferences.

Booking.com and Airbnb brand icons are served locally from `assets/*-logo.svg`, sourced from Simple Icons via cdn.simpleicons.org. The WhatsApp icon uses the same source and is embedded inline. Booking.com links to the owner-supplied listing in the current tab with a generous tap target. Airbnb is non-clickable, muted and marked with a diagonal coming-soon stamp, translated with the selected language.

The finish includes a matching native scrollbar, fine accent lines and a compact heritage section. On mobile, the historic panorama spans the full content width, with an inset caption and a single larger archival photo styled as a lightly tilted postcard on mobile and desktop. Desktop hero parallax uses passive scrolling and animation frames, and turns off on mobile and for reduced-motion preferences.


## Languages

English, German, Italian and French are available through the EN / DE / IT / FR buttons at the bottom of the mobile navigation and beside desktop navigation links. Switching updates the current page without a reload and preserves form entries. On first visit, the first supported browser language is selected, including regional variants such as de-AT or fr-CA. A saved manual selection takes priority. English is the fallback when no browser language is supported or JavaScript is unavailable.

`locales.js` contains the German, Italian and French translations, keyed by English source text. When changing English copy, update its translation key too. Translations include photo captions, accessibility labels, metadata, date validation and WhatsApp inquiry drafts. Native date pickers and standard browser validation follow the guest's browser settings. The build and Docker configuration include the locale script.

## Booking.com availability calendar

The enquiry form includes a collapsed, read-only calendar covering the current month and the following eleven months. Opening it fetches `/api/availability`. Only this API route runs the Worker first; normal files use static asset serving. It uses the Workers Cache API and no paid database, KV binding or scheduled job. Confirm that the account uses **Workers Free** before deployment; account-wide limits still apply.

### Connect the private feed

1. Deploy the updated repository through the existing Cloudflare build pipeline (`node build.mjs`, then `npx wrangler deploy`). Include `worker/`, `calendar.js` and the updated `wrangler.jsonc`. The Worker entry point is `worker/index.mjs`; it is bundled separately and is never copied into `dist`. This must happen first: Cloudflare does not allow secrets on a static-assets-only deployment. Until the secret is added, the calendar safely shows unavailable.
2. After deployment succeeds, open Cloudflare **Workers & Pages → rabac-appartment → Settings → Variables and Secrets → Add**. Refresh the dashboard if necessary.
3. Choose **Secret**. Set the name to `BOOKING_ICAL_URL` and the value to the apartment's Booking.com iCal export URL. Select **Deploy** to save it. Never put the URL in HTML, JavaScript, Git or a public issue.
4. Open the public site's enquiry form and expand **View availability calendar**. Compare several actual reservations and checkout dates against the Booking.com host calendar before relying on it.

The API accepts HTTPS Booking.com export URLs and returns only merged start/end date ranges and a fetch timestamp. The last date of an iCal event is checkout and is not an occupied night unless another block starts that day. Cancelled and transparent events are ignored. The parser accepts all-day `DTSTART`/`DTEND` events; malformed, recurring or timed events fail safely rather than showing false availability. If the real feed has another format, adapt the parser against a redacted sample before enabling it.

Successful responses are cached for five minutes per Cloudflare location and refreshed on demand, not by a global scheduled poll. Booking.com itself may update its export later. The browser discards data over ten minutes old. Fetch failures, missing configuration and unsupported feeds show an unavailable message with a retry button. An unblocked date is labelled **No block shown**, not guaranteed available; reservations from other channels are visible only if reflected in the source feed. The enquiry form always remains usable.

Run `node --test worker/calendar.test.mjs` for parser, privacy, error and caching checks. For a full local preview use `npx wrangler dev` with a supported Node.js version and a private `.dev.vars` file containing `BOOKING_ICAL_URL`; `.dev.vars*` and `.env*` are ignored by Git. The plain Docker/static-file preview has no calendar API and therefore shows the unavailable state. Do not use a real feed in browser-side test fixtures.

If the deployed calendar is unavailable, open `/api/availability`. Error responses contain only a safe `reason` code (and the HTTP status from Booking.com when applicable), never the feed URL or reservation content. `missing_feed_secret` means the production Worker lacks the secret; `invalid_feed_url` means it is not an accepted HTTPS Booking.com URL; `feed_http_error`, `feed_connection_failed`, `feed_timeout` and `feed_read_failed` distinguish upstream HTTP, connection, timeout and response-body failures; `unsupported_date_format` / `unsupported_recurring_event` require checking a redacted event sample before changing parsing rules. Cache lookup failures fall back to fetching the feed. Up to three HTTPS redirects within Booking.com are followed, sharing the same eight-second timeout; redirect errors use `feed_redirect_invalid`, `feed_redirect_limit` or `feed_redirect_not_allowed`.
