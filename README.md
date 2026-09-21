# Mare Beachfront Apartment

A responsive static single-page website at Obala Maršala Tita 29, 52221 Rabac, Croatia. No build step or JavaScript dependencies.

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

Booking.com and Airbnb brand icons are served locally from `assets/*-logo.svg`, sourced from Simple Icons via cdn.simpleicons.org. The WhatsApp icon uses the same source and is embedded inline. Booking.com links to the owner-supplied listing; Airbnb is displayed without a link.

The finish includes a matching native scrollbar, fine accent lines and a compact heritage section. On mobile, the historic panorama spans the full content width, with an inset caption and a single larger archival photo styled as a lightly tilted postcard on mobile and desktop. Desktop hero parallax uses passive scrolling and animation frames, and turns off on mobile and for reduced-motion preferences.


## Languages

English, German, Italian and French are available through the EN / DE / IT / FR buttons at the bottom of the mobile navigation and beside desktop navigation links. Switching updates the current page without a reload and preserves form entries. The preference is stored locally; English remains the default and no-JavaScript fallback.

`locales.js` contains the German, Italian and French translations, keyed by English source text. When changing English copy, update its translation key too. Translations include photo captions, accessibility labels, metadata, date validation and WhatsApp inquiry drafts. Native date pickers and standard browser validation follow the guest's browser settings. The build and Docker configuration include the locale script.
