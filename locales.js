// English remains in the HTML as the no-JavaScript fallback.
// Bind individual text nodes so switching languages preserves icons, inputs and listeners.
window.MareLocale = (() => {
  const translations = {
    "Skip to content": ["Zum Inhalt", "Vai al contenuto"],
    "Mare Beachfront Apartment home": ["Mare – Startseite", "Mare – pagina iniziale"],
    "Main navigation": ["Hauptnavigation", "Navigazione principale"],
    "Language": ["Sprache", "Lingua"],
    "Open navigation": ["Menü öffnen", "Apri il menu"],
    "Close navigation": ["Menü schließen", "Chiudi il menu"],
    "BEACHFRONT APARTMENT": ["FERIENWOHNUNG AM MEER", "APPARTAMENTO SUL MARE"],
    "The apartment": ["Die Wohnung", "L’appartamento"],
    "Gallery": ["Bilder", "Foto"],
    "Location": ["Lage", "Dove siamo"],
    "Contact": ["Kontakt", "Contatti"],
    "Availability": ["Anfragen", "Disponibilità"],
    "RABAC, ISTRIA · CROATIA": ["RABAC, ISTRIEN · KROATIEN", "RABAC, ISTRIA · CROAZIA"],
    "Beachfront": ["Direkt am Meer", "Sul mare"],
    "Apartment Rabac": ["Ferienwohnung Rabac", "Appartamento a Rabac"],
    "Directly on the sea": ["Direkt am Meer", "Direttamente sul mare"],
    "2 bedrooms": ["2 Schlafzimmer", "2 camere da letto"],
    "Private parking": ["Privatparkplatz", "Parcheggio privato"],
    "Slow down by the sea.": ["Zur Ruhe kommen, direkt am Meer.", "Rallenta, sei al mare."],
    "Check Availability": ["Verfügbarkeit anfragen", "Verifica disponibilità"],
    "Right by the sea": ["Direkt am Meer", "In riva al mare"],
    "Free private parking": ["Kostenloser Privatparkplatz", "Parcheggio privato gratuito"],
    "Sea-view terrace": ["Terrasse mit Meerblick", "Terrazza vista mare"],
    "MARE APARTMENT": ["FERIENWOHNUNG MARE", "APPARTAMENTO MARE"],
    "Stay by": ["Wohnen am", "Un soggiorno sul"],
    "the sea.": ["Meer.", "mare."],
    "A two-bedroom apartment on the waterfront in Rabac, near Labin. Sea views, a terrace and free private parking. Suitable for couples and small families.": ["Eine Ferienwohnung mit zwei Schlafzimmern direkt am Wasser in Rabac, nahe Labin. Mit Meerblick, Terrasse und kostenlosem Privatparkplatz. Für Paare und kleine Familien.", "Un appartamento con due camere da letto sul lungomare di Rabac, vicino a Labin. Vista mare, terrazza e parcheggio privato gratuito. Ideale per coppie e piccole famiglie."],
    "View photos": ["Fotos ansehen", "Guarda le foto"],
    "Fully equipped kitchen": ["Voll ausgestattete Küche", "Cucina attrezzata"],
    "Panoramic sea view": ["Panoramablick aufs Meer", "Vista panoramica sul mare"],
    "Direct beach access": ["Direkter Strandzugang", "Accesso diretto alla spiaggia"],
    "Air conditioning": ["Klimaanlage", "Aria condizionata"],
    "Complimentary WiFi": ["Kostenloses WLAN", "Wi-Fi gratuito"],
    "Couples & small families": ["Paare & kleine Familien", "Coppie e piccole famiglie"],
    "GALLERY": ["BILDER", "FOTO"],
    "The": ["Die", "Il tuo"],
    "apartment.": ["Wohnung.", "appartamento."],
    "6 PHOTOS": ["6 FOTOS", "6 FOTO"],
    "Apartment photos": ["Fotos der Ferienwohnung", "Foto dell’appartamento"],
    "Open-plan space": ["Offener Wohnbereich", "Ambiente open space"],
    "Seating area": ["Sitzecke", "Zona relax"],
    "Bedroom 1": ["Schlafzimmer 1", "Camera 1"],
    "Bedroom 2": ["Schlafzimmer 2", "Camera 2"],
    "From the beach": ["Vom Strand aus", "Dalla spiaggia"],
    "Entrance & stairs": ["Eingang & Treppe", "Ingresso e scale"],
    "Entrance & stairs — the older character of the house": ["Eingang & Treppe", "Ingresso e scale"],
    "Previous gallery photo": ["Vorheriges Galeriefoto", "Foto precedente"],
    "Next gallery photo": ["Nächstes Galeriefoto", "Foto successiva"],
    "Apartment photo gallery": ["Fotogalerie der Ferienwohnung", "Galleria fotografica dell’appartamento"],
    "Close gallery": ["Galerie schließen", "Chiudi la galleria"],
    "Previous photo": ["Vorheriges Foto", "Foto precedente"],
    "Next photo": ["Nächstes Foto", "Foto successiva"],
    "Rabac, in years gone by": ["Rabac in früheren Zeiten", "Rabac, un tempo"],
    "A HOUSE WITH HISTORY": ["EIN HAUS MIT GESCHICHTE", "UNA CASA RICCA DI STORIA"],
    "A century": ["Ein Jahrhundert", "Un secolo"],
    "by the sea.": ["am Meer.", "sul mare."],
    "LOCATION": ["LAGE", "DOVE SIAMO"],
    "Istria.": ["Istrien.", "Istria."],
    "On the waterfront, a short drive from Labin.": ["Direkt am Wasser, nur eine kurze Fahrt von Labin entfernt.", "Sul lungomare, a pochi minuti d’auto da Labin."],
    "52221 Rabac, Istria, Croatia": ["52221 Rabac, Istrien, Kroatien", "52221 Rabac, Istria, Croazia"],
    "Free private parking included.": ["Kostenloser Privatparkplatz inklusive.", "Parcheggio privato gratuito incluso."],
    "Get directions": ["Route planen", "Indicazioni stradali"],
    "ON THE ADRIATIC": ["AN DER ADRIA", "SULL’ADRIATICO"],
    "CONTACT": ["KONTAKT", "CONTATTI"],
    "Reserve": ["Buchen Sie", "Prenota"],
    "your stay.": ["Ihren Aufenthalt.", "il tuo soggiorno."],
    "Book direct. Ask us for the best available rate.": ["Direkt buchen. Fragen Sie uns nach dem besten verfügbaren Preis.", "Prenota direttamente. Chiedici la migliore tariffa disponibile."],
    "Email": ["E-Mail", "Email"],
    "Phone": ["Telefon", "Telefono"],
    "Also available on": ["Auch buchbar auf", "Disponibile anche su"],
    "Check availability": ["Verfügbarkeit anfragen", "Verifica disponibilità"],
    "Your name": ["Ihr Name", "Il tuo nome"],
    "Full name": ["Vor- und Nachname", "Nome e cognome"],
    "(optional)": ["(optional)", "(facoltativo)"],
    "Arrival": ["Anreise", "Arrivo"],
    "Departure": ["Abreise", "Partenza"],
    "Your message": ["Ihre Nachricht", "Il tuo messaggio"],
    "Guests or questions": ["Gäste oder Fragen", "Ospiti o domande"],
    "Check availability on WhatsApp": ["Über WhatsApp anfragen", "Chiedi su WhatsApp"],
    "Continue on WhatsApp": ["Weiter zu WhatsApp", "Continua su WhatsApp"],
    "Obala Maršala Tita 29 · 52221 Rabac, Croatia": ["Obala Maršala Tita 29 · 52221 Rabac, Kroatien", "Obala Maršala Tita 29 · 52221 Rabac, Croazia"],
    "Mare Beachfront Apartment.": ["Mare Ferienwohnung am Meer.", "Mare Appartamento sul mare."],
    "Open WhatsApp with an inquiry about Mare": ["Anfrage zu Mare in WhatsApp öffnen", "Apri WhatsApp per informazioni su Mare"],
    "Please choose a departure after your arrival.": ["Bitte wählen Sie ein Abreisedatum nach Ihrer Anreise.", "Scegli una data di partenza successiva all’arrivo."],
    "Review and send your inquiry in WhatsApp.": ["Prüfen und senden Sie Ihre Anfrage in WhatsApp.", "Controlla e invia la richiesta su WhatsApp."],
    "Hello, I’m interested in the beachfront apartment in Rabac": ["Hallo, ich interessiere mich für die Ferienwohnung am Meer in Rabac.", "Buongiorno, mi interessa l’appartamento sul mare a Rabac."],
    "Hello, could you check availability and your best direct rate for Mare Beachfront Apartment?": ["Hallo, könnten Sie mir die Verfügbarkeit und Ihren besten Preis bei Direktbuchung für die Ferienwohnung Mare mitteilen?", "Buongiorno, potreste indicarmi la disponibilità e la migliore tariffa per una prenotazione diretta dell’appartamento Mare?"],
    "Name": ["Name", "Nome"],
    "Apartment terrace with shaded outdoor seating overlooking Rabac harbour and the Adriatic Sea": ["Terrasse mit schattigen Sitzplätzen und Blick auf den Hafen von Rabac und die Adria", "Terrazza con posti a sedere all’ombra e vista sul porto di Rabac e sull’Adriatico"],
    "Fully equipped kitchen and dining table beside the apartment living area": ["Voll ausgestattete Küche mit Esstisch im offenen Wohnbereich", "Cucina attrezzata e tavolo da pranzo nell’ambiente open space"],
    "Sofa and coffee table in the open-plan kitchen, dining and seating area": ["Sofa und Couchtisch im offenen Wohn-, Koch- und Essbereich", "Divano e tavolino nell’ambiente open space con cucina e zona pranzo"],
    "Double bedroom with bedside lights and a window overlooking Rabac": ["Schlafzimmer mit Doppelbett, Nachttischlampen und Fenster mit Blick auf Rabac", "Camera matrimoniale con lampade da comodino e finestra su Rabac"],
    "Second double bedroom with bedside lamps and a seating area": ["Zweites Schlafzimmer mit Doppelbett, Nachttischlampen und Sitzecke", "Seconda camera matrimoniale con lampade da comodino e zona relax"],
    "Waterfront houses and the promenade seen from the beach in Rabac": ["Häuser am Wasser und Promenade, vom Strand in Rabac aus gesehen", "Case sul lungomare e passeggiata viste dalla spiaggia di Rabac"],
    "The house entrance and hallway with worn wooden stairs and a wooden banister": ["Hauseingang und Flur mit alten Holzstufen und Holzgeländer", "Ingresso e corridoio della casa con vecchie scale e corrimano in legno"],
    "Historic postcard of Rabac harbour with sailing boats along the waterfront": ["Historische Postkarte des Hafens von Rabac mit Segelbooten am Ufer", "Cartolina storica del porto di Rabac con barche a vela sul lungomare"],
    "Historic panorama of Rabac, with waterfront houses below the hillside and sailing boats in the harbour": ["Historisches Panorama von Rabac mit Häusern am Wasser unterhalb des Hügels und Segelbooten im Hafen", "Panorama storico di Rabac con case sul lungomare ai piedi della collina e barche a vela nel porto"],
    "Historic view of boats moored beside the stone waterfront and houses in Rabac": ["Historische Ansicht von Booten am steinernen Kai und Häusern in Rabac", "Veduta storica delle barche ormeggiate lungo la banchina in pietra e delle case di Rabac"],
    "Google Maps — Mare apartment, Obala Maršala Tita 29, Rabac": ["Google Maps – Ferienwohnung Mare, Obala Maršala Tita 29, Rabac", "Google Maps – Appartamento Mare, Obala Maršala Tita 29, Rabac"],
    "Beachfront Apartment Rabac Labin – Sea View, 2 Bedrooms, Private Parking | Mare": ["Ferienwohnung am Meer in Rabac bei Labin – Meerblick, 2 Schlafzimmer, Privatparkplatz | Mare", "Appartamento sul mare a Rabac, Labin – Vista mare, 2 camere, parcheggio privato | Mare"],
    "Mare Beachfront Apartment · Rabac": ["Mare Ferienwohnung am Meer · Rabac", "Mare Appartamento sul mare · Rabac"],
    "Discover Mare Beachfront Apartment in Rabac, near Labin, Istria. A peaceful apartment rental directly on the sea, with panoramic sea views, 2 bedrooms and free private parking.": ["Entdecken Sie die Ferienwohnung Mare in Rabac bei Labin, Istrien. Ruhig und direkt am Meer, mit Panoramablick, 2 Schlafzimmern und kostenlosem Privatparkplatz.", "Scopri l’appartamento Mare sul mare a Rabac, vicino a Labin, in Istria. Un soggiorno tranquillo con vista panoramica, 2 camere da letto e parcheggio privato gratuito."],
    "Beachfront apartment in Rabac, near Labin. Two bedrooms, a sea-view terrace and private parking.": ["Ferienwohnung direkt am Meer in Rabac bei Labin. Zwei Schlafzimmer, Terrasse mit Meerblick und Privatparkplatz.", "Appartamento sul mare a Rabac, vicino a Labin. Due camere da letto, terrazza vista mare e parcheggio privato."],
  };
  let locale = "en";
  const bindings = [];
  let onChange = () => {};
  const normalize = (value) => value.trim().replace(/\s+/g, " ");
  const t = (key) => locale === "en" ? key : translations[key]?.[locale === "de" ? 0 : 1] ?? key;
  function setLocale(next, persist = true) {
    if (!["en", "de", "it"].includes(next)) return;
    locale = next;
    document.documentElement.lang = locale;
    bindings.forEach(({ node, attribute, key, original }) => {
      const value = locale === "en" ? original : original.replace(original.trim(), t(key));
      if (attribute) node.setAttribute(attribute, value);
      else node.nodeValue = value;
    });
    document.querySelectorAll("[data-locale]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
    });
    if (persist) {
      try { localStorage.setItem("mare-locale", locale); } catch { /* Storage may be disabled. */ }
    }
    onChange();
  }
  function init(callback) {
    onChange = callback;
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest("script, style, svg, [data-locale]")) continue;
      const key = normalize(node.nodeValue);
      if (Object.hasOwn(translations, key)) bindings.push({ node, key, original: node.nodeValue });
    }
    document.querySelectorAll("[alt], [title], [aria-label], [placeholder], [data-caption], [data-photo-count], meta[content]").forEach((node) => {
      for (const attribute of ["alt", "title", "aria-label", "placeholder", "data-caption", "data-photo-count", "content"]) {
        const original = node.getAttribute(attribute);
        if (original && Object.hasOwn(translations, normalize(original))) {
          bindings.push({ node, attribute, key: normalize(original), original });
        }
      }
    });
    document.querySelectorAll("[data-locale]").forEach((button) => {
      button.addEventListener("click", () => setLocale(button.dataset.locale));
    });
    let saved = "en";
    try { saved = localStorage.getItem("mare-locale") || "en"; } catch { /* English fallback. */ }
    setLocale(["en", "de", "it"].includes(saved) ? saved : "en", false);
    document.querySelector(".language-picker").hidden = false;
  }
  return { t, init };
})();
