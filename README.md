# Mare Beachfront Apartment

A responsive static single-page website at Obala Maršala Tita 29, 52221 Rabac, Croatia, with a small Cloudflare Worker for the optional availability calendar. No JavaScript dependencies.

## Run locally in Docker

Run `docker compose up -d` and open http://localhost:8081. Nginx serves files through read-only mounts, so edits appear on refresh without rebuilding. The port is bound to the local machine only. Use `docker compose ps` for status, `docker compose logs web` for logs, and `docker compose down` to stop.

Alternatively, open `index.html` directly. Google Maps and Google Fonts require an internet connection.

## Before publishing

Cloudflare Workers deployment is configured in `wrangler.jsonc`. Set the dashboard build command to `node build.mjs`, deploy command to `npx wrangler deploy`, and version command to `npx wrangler versions upload`. Keep production branch `main` and root `/`. Commit and push the configuration and build script before triggering a new deployment. The build copies only the website files to `dist`; never use the repository root as the assets directory.

- Owner contacts are configured: WhatsApp/phone `+385 98 170 0612`, email `marizahm305@gmail.com`. Update `CONTACT` in `script.js` and the HTML fallback links together when changing them.
- The terrace leads the page. The six-photo gallery includes the kitchen, living room, both bedrooms, beach view and hallway last. It uses one horizontal photo strip on every screen size, with swipe/trackpad scrolling, arrow controls and a photo counter. Two upscaled historical images appear separately in the heritage section, served from `assets`; originals remain in `historical`.
- The header Availability and hero Check Availability buttons scroll to the final contact section containing the calendar and enquiry form. The form validates dates and opens WhatsApp with the guest's name, dates, optional email and message prefilled. Guests review and send the message themselves. A visible continuation link is provided if a browser blocks the new tab.
- Confirm amenities and third-party platform availability with the owner. The Google Maps embed and directions link use the supplied full address; check Google's marker against the entrance before publishing.
- SEO is configured for `https://rabac.mateolabs.dev/`: canonical URL, social preview image, LodgingBusiness structured data, `robots.txt` and `sitemap.xml`. Before switching domains, replace that origin in `index.html`, `robots.txt` and `sitemap.xml`, update `wrangler.jsonc`, and rebuild. Submit the final sitemap in Google Search Console after deployment. Language switches share one URL; they are not separate indexable language pages.
- `_headers` supplies basic security headers on deployed static assets. The build publishes only the listed website files. Docker must be recreated with `docker compose up -d` after adding new bind mounts; a running older container can otherwise return 404 for new scripts.

## Photography advice

The terrace leads with the owner-supplied 4096 × 2732 upscaled photo (`assets/terrace-clear.webp`). The original is retained locally; the build publishes responsive 960px and 1920px WebP versions (about 94 KB and 297 KB), plus a 1200px JPEG for social previews. Brighter interior photos in soft daylight, with straight verticals and consistent lighting, would improve the presentation.

Google Fonts provides DM Sans and Manrope; system font fallbacks keep the page usable offline. Photos are served locally. The hero is eagerly loaded and gallery photos are lazy loaded. Navigation and content remain available without JavaScript. Gallery supports keyboard navigation, Escape, modal focus containment, and reduced motion preferences.

The contact section shows larger Booking.com and Airbnb links above the enquiry form on mobile, with email and phone at the bottom. The form and floating WhatsApp control provide direct enquiries without a duplicate button under the heading. Booking.com and Airbnb brand icons are served locally from `assets/*-logo.svg`, sourced from Simple Icons via cdn.simpleicons.org. The WhatsApp icon uses the same source and is embedded inline. Booking.com uses the owner-supplied share link (`https://www.booking.com/Share-iqp587`) in the current tab with a generous tap target. This resolves to the Mare apartment listing; mobile browser/app handoff should also be checked on a phone after deployment. Airbnb is non-clickable, muted and marked with a diagonal coming-soon stamp, translated with the selected language.

The finish includes a matching native scrollbar, fine accent lines and a compact heritage section. On mobile, the historic panorama spans the full content width, with an inset caption and a single larger archival photo styled as a lightly tilted postcard on mobile and desktop. Desktop hero parallax uses passive scrolling and animation frames, and turns off on mobile and for reduced-motion preferences.


## Offline viewing and home-screen installation

After a successful online visit, a small service worker saves the page, address, contact details, scripts, app icons and terrace images. Other local photos are saved as viewed. On weak connections, saved content is used if the request takes longer than four seconds; online requests otherwise refresh the cache. The location section shows a translated notice when the device is offline. Google Maps, Booking.com, WhatsApp and live availability still need their own connections; calendar API responses and enquiry submissions are never stored by the service worker.

The manifest supports browser-provided home-screen installation, opening directly at the location section. HTTPS (or localhost for development) is required. Offline access needs an initial successful visit and browser storage; clearing browser data removes it. The build automatically versions the offline cache from file contents. Updated workers activate after existing tabs close, then remove only obsolete Mare caches. No forced reload interrupts an enquiry.

Run `node --test calendar.test.mjs sw.test.mjs worker/calendar.test.mjs` for all calendar and service-worker checks. To verify manually, serve `dist`, visit online, wait for the service worker to activate, then switch DevTools to Offline and reload. Confirm the address and phone remain visible and the calendar does not show cached availability. Restore the connection and confirm the offline notice disappears.

## Languages

English, German, Italian and French are available through the EN / DE / IT / FR buttons at the bottom of the mobile navigation and beside desktop navigation links. Switching updates the current page without a reload and preserves form entries. On first visit, the first supported browser language is selected, including regional variants such as de-AT or fr-CA. A saved manual selection takes priority. English is the fallback when no browser language is supported or JavaScript is unavailable.

`locales.js` contains the German, Italian and French translations, keyed by English source text. When changing English copy, update its translation key too. Translations include photo captions, accessibility labels, metadata, date validation and WhatsApp inquiry drafts. Native date pickers and standard browser validation follow the guest's browser settings. The build and Docker configuration include the locale script.

## Booking.com availability calendar

The enquiry form includes a read-only calendar that is open by default, covering the current month and the following eleven months. It fetches `/api/availability` automatically on page load. Only this API route runs the Worker first; normal files use static asset serving. It uses the Workers Cache API and no paid database, KV binding or scheduled job. Confirm that the account uses **Workers Free** before deployment; account-wide limits still apply.

### Connect the private feed

1. Deploy the updated repository through the existing Cloudflare build pipeline (`node build.mjs`, then `npx wrangler deploy`). Include `worker/`, `calendar.js` and the updated `wrangler.jsonc`. The Worker entry point is `worker/index.mjs`; it is bundled separately and is never copied into `dist`. This must happen first: Cloudflare does not allow secrets on a static-assets-only deployment. Until the secret is added, the calendar safely shows unavailable.
2. After deployment succeeds, open Cloudflare **Workers & Pages → rabac-appartment → Settings → Variables and Secrets → Add**. Refresh the dashboard if necessary.
3. Choose **Secret**. Set the name to `BOOKING_ICAL_URL` and the value to the apartment's Booking.com iCal export URL. Select **Deploy** to save it. Never put the URL in HTML, JavaScript, Git or a public issue.
4. Open the public site's enquiry form and expand **View availability calendar**. Compare several actual reservations and checkout dates against the Booking.com host calendar before relying on it.

The API accepts HTTPS Booking.com export URLs and returns only merged start/end date ranges and a fetch timestamp. The last date of an iCal event is checkout and is not an occupied night unless another block starts that day. Cancelled and transparent events are ignored. The parser accepts all-day `DTSTART`/`DTEND` events; malformed, recurring or timed events fail safely rather than showing false availability. If the real feed has another format, adapt the parser against a redacted sample before enabling it.

Successful responses are cached for five minutes per Cloudflare location and refreshed on demand, not by a global scheduled poll. Booking.com itself may update its export later. The browser discards data over ten minutes old. Fetch failures, missing configuration and unsupported feeds show an unavailable message with a retry button. An unblocked date is labelled **Available**; availability still needs confirmation, and reservations from other channels are visible only if reflected in the source feed. Drag between available arrival and departure dates, or select each endpoint, to fill the enquiry fields. Reserved dates and ranges crossing reservations cannot be selected. Manual date entry remains supported with the same availability validation when the feed is fresh. The enquiry form remains usable if the feed is unavailable.

Run `node --test calendar.test.mjs worker/calendar.test.mjs` for browser loading, retry, clock-skew, parser, privacy, error and caching checks. For a full local preview use `npx wrangler dev` with a supported Node.js version and a private `.dev.vars` file containing `BOOKING_ICAL_URL`; `.dev.vars*` and `.env*` are ignored by Git. The plain Docker/static-file preview has no calendar API and therefore shows the unavailable state. Do not use a real feed in browser-side test fixtures.

If the deployed calendar is unavailable, open `/api/availability`. Error responses contain only a safe `reason` code (and the HTTP status from Booking.com when applicable), never the feed URL or reservation content. `missing_feed_secret` means the production Worker lacks the secret; `invalid_feed_url` means it is not an accepted HTTPS Booking.com URL; `feed_http_error`, `feed_connection_failed`, `feed_timeout` and `feed_read_failed` distinguish upstream HTTP, connection, timeout and response-body failures; `unsupported_date_format` / `unsupported_recurring_event` require checking a redacted event sample before changing parsing rules. Cache lookup failures fall back to fetching the feed. Up to three HTTPS redirects within Booking.com are followed, sharing the same eight-second timeout; redirect errors use `feed_redirect_invalid`, `feed_redirect_limit` or `feed_redirect_not_allowed`.
