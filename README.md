# Mare Beachfront Apartment

A responsive static single-page website at Obala Maršala Tita 29, 52221 Rabac, Croatia. No build step or JavaScript dependencies.

## Run locally in Docker

Run `docker compose up -d` and open http://localhost:8081. Nginx serves files through read-only mounts, so edits appear on refresh without rebuilding. The port is bound to the local machine only. Use `docker compose ps` for status, `docker compose logs web` for logs, and `docker compose down` to stop.

Alternatively, open `index.html` directly. Google Maps and Google Fonts require an internet connection.

## Before publishing

- Set the owner's WhatsApp number (international digits), email and phone in `CONTACT` at the beginning of `script.js`. Also update the HTML fallback contact links for visitors without JavaScript. Until configured, WhatsApp opens its share flow with the requested message; it cannot open an owner-specific chat without the owner's number.
- The page now uses five supplied apartment photos: terrace hero, kitchen/dining, living room, and both bedrooms. Originals are unchanged. The aerial and bathroom photos remain in assets but are not loaded by the page.
- The form validates dates and prepares an inquiry. It does not claim to send messages. After configuring email, it supplies a mailto draft for the visitor to send. A Formspree or server endpoint can be added to the submit handler for direct submission.
- Confirm amenities and third-party platform availability with the owner. The Google Maps embed and directions link use the supplied full address; check Google's marker against the entrance before publishing.
- Add the final domain's canonical URL and absolute Open Graph image URL when deployed.

## Photography advice

The terrace is the strongest lead photo because it shows the actual waterfront setting. For a sharper desktop hero, supply a landscape original at least 2000 pixels wide (the current image is 1024 × 683). Brighter interior photos in soft daylight, with straight verticals and consistent lighting, would improve the presentation.

Google Fonts provides DM Sans and Manrope; system font fallbacks keep the page usable offline. Photos are served locally. The hero is eagerly loaded and gallery photos are lazy loaded. Navigation and content remain available without JavaScript. Gallery supports keyboard navigation, Escape, modal focus containment, and reduced motion preferences.
