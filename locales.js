// English remains in the HTML as the no-JavaScript fallback.
// Bind individual text nodes so switching languages preserves icons, inputs and listeners.
window.MareLocale = (() => {
  const translations = {
    "Skip to content": ["Zum Inhalt", "Vai al contenuto", "Aller au contenu"],
    "Mare Beachfront Apartment home": ["Mare – Startseite", "Mare – pagina iniziale", "Mare – accueil"],
    "Main navigation": ["Hauptnavigation", "Navigazione principale", "Navigation principale"],
    "Language": ["Sprache", "Lingua", "Langue"],
    "Open navigation": ["Menü öffnen", "Apri il menu", "Ouvrir le menu"],
    "Close navigation": ["Menü schließen", "Chiudi il menu", "Fermer le menu"],
    "BEACHFRONT APARTMENT": ["FERIENWOHNUNG AM MEER", "APPARTAMENTO SUL MARE", "APPARTEMENT EN BORD DE MER"],
    "The apartment": ["Die Wohnung", "L’appartamento", "L’appartement"],
    "Gallery": ["Bilder", "Foto", "Photos"],
    "Location": ["Lage", "Dove siamo", "Situation"],
    "Contact": ["Kontakt", "Contatti", "Contact"],
    "Availability": ["Anfragen", "Disponibilità", "Disponibilités"],
    "RABAC, ISTRIA · CROATIA": ["RABAC, ISTRIEN · KROATIEN", "RABAC, ISTRIA · CROAZIA", "RABAC, ISTRIE · CROATIE"],
    "Beachfront": ["Direkt am Meer", "Sul mare", "En bord de mer"],
    "Apartment Rabac": ["Ferienwohnung Rabac", "Appartamento a Rabac", "Appartement à Rabac"],
    "Directly on the sea": ["Direkt am Meer", "Direttamente sul mare", "Face à la mer"],
    "2 bedrooms": ["2 Schlafzimmer", "2 camere da letto", "2 chambres"],
    "Private parking": ["Privatparkplatz", "Parcheggio privato", "Parking privé"],
    "Slow down by the sea.": ["Zur Ruhe kommen, direkt am Meer.", "Rallenta, sei al mare.", "Prenez le temps, au bord de la mer."],
    "Check Availability": ["Verfügbarkeit anfragen", "Verifica disponibilità", "Voir les disponibilités"],
    "Right by the sea": ["Direkt am Meer", "In riva al mare", "Au bord de la mer"],
    "Free private parking": ["Kostenloser Privatparkplatz", "Parcheggio privato gratuito", "Parking privé gratuit"],
    "Sea-view terrace": ["Terrasse mit Meerblick", "Terrazza vista mare", "Terrasse avec vue mer"],
    "MARE APARTMENT": ["FERIENWOHNUNG MARE", "APPARTAMENTO MARE", "APPARTEMENT MARE"],
    "Stay by": ["Wohnen am", "Un soggiorno sul", "Séjournez au bord de"],
    "the sea.": ["Meer.", "mare.", "la mer."],
    "A two-bedroom apartment on the waterfront in Rabac, near Labin. Sea views, a terrace and free private parking. Suitable for couples and small families.": ["Eine Ferienwohnung mit zwei Schlafzimmern direkt am Wasser in Rabac, nahe Labin. Mit Meerblick, Terrasse und kostenlosem Privatparkplatz. Für Paare und kleine Familien.", "Un appartamento con due camere da letto sul lungomare di Rabac, vicino a Labin. Vista mare, terrazza e parcheggio privato gratuito. Ideale per coppie e piccole famiglie.", "Un appartement de deux chambres sur le front de mer de Rabac, près de Labin. Vue mer, terrasse et parking privé gratuit. Idéal pour les couples et les petites familles."],
    "View photos": ["Fotos ansehen", "Guarda le foto", "Voir les photos"],
    "Fully equipped kitchen": ["Voll ausgestattete Küche", "Cucina attrezzata", "Cuisine tout équipée"],
    "Panoramic sea view": ["Panoramablick aufs Meer", "Vista panoramica sul mare", "Vue panoramique sur la mer"],
    "Direct beach access": ["Direkter Strandzugang", "Accesso diretto alla spiaggia", "Accès direct à la plage"],
    "Air conditioning": ["Klimaanlage", "Aria condizionata", "Climatisation"],
    "Complimentary WiFi": ["Kostenloses WLAN", "Wi-Fi gratuito", "Wi-Fi gratuit"],
    "Couples & small families": ["Paare & kleine Familien", "Coppie e piccole famiglie", "Couples et petites familles"],
    "GALLERY": ["BILDER", "FOTO", "PHOTOS"],
    "The": ["Die", "Il tuo", "Votre"],
    "apartment.": ["Wohnung.", "appartamento.", "appartement."],
    "6 PHOTOS": ["6 FOTOS", "6 FOTO", "6 PHOTOS"],
    "Apartment photos": ["Fotos der Ferienwohnung", "Foto dell’appartamento", "Photos de l’appartement"],
    "Open-plan space": ["Offener Wohnbereich", "Ambiente open space", "Pièce de vie ouverte"],
    "Seating area": ["Sitzecke", "Zona relax", "Coin salon"],
    "Bedroom 1": ["Schlafzimmer 1", "Camera 1", "Chambre 1"],
    "Bedroom 2": ["Schlafzimmer 2", "Camera 2", "Chambre 2"],
    "From the beach": ["Vom Strand aus", "Dalla spiaggia", "Depuis la plage"],
    "Entrance & stairs": ["Eingang & Treppe", "Ingresso e scale", "Entrée et escalier"],
    "Entrance & stairs — the older character of the house": ["Eingang & Treppe", "Ingresso e scale", "Entrée et escalier"],
    "Previous gallery photo": ["Vorheriges Galeriefoto", "Foto precedente", "Photo précédente"],
    "Next gallery photo": ["Nächstes Galeriefoto", "Foto successiva", "Photo suivante"],
    "Apartment photo gallery": ["Fotogalerie der Ferienwohnung", "Galleria fotografica dell’appartamento", "Galerie de photos de l’appartement"],
    "Close gallery": ["Galerie schließen", "Chiudi la galleria", "Fermer la galerie"],
    "Previous photo": ["Vorheriges Foto", "Foto precedente", "Photo précédente"],
    "Next photo": ["Nächstes Foto", "Foto successiva", "Photo suivante"],
    "Rabac, in years gone by": ["Rabac in früheren Zeiten", "Rabac, un tempo", "Rabac, autrefois"],
    "A HOUSE WITH HISTORY": ["EIN HAUS MIT GESCHICHTE", "UNA CASA RICCA DI STORIA", "UNE MAISON CHARGÉE D’HISTOIRE"],
    "A century": ["Ein Jahrhundert", "Un secolo", "Un siècle"],
    "by the sea.": ["am Meer.", "sul mare.", "au bord de la mer."],
    "LOCATION": ["LAGE", "DOVE SIAMO", "SITUATION"],
    "Istria.": ["Istrien.", "Istria.", "Istrie."],
    "On the waterfront, a short drive from Labin.": ["Direkt am Wasser, nur eine kurze Fahrt von Labin entfernt.", "Sul lungomare, a pochi minuti d’auto da Labin.", "Sur le front de mer, à quelques minutes en voiture de Labin."],
    "52221 Rabac, Istria, Croatia": ["52221 Rabac, Istrien, Kroatien", "52221 Rabac, Istria, Croazia", "52221 Rabac, Istrie, Croatie"],
    "Free private parking included.": ["Kostenloser Privatparkplatz inklusive.", "Parcheggio privato gratuito incluso.", "Parking privé gratuit inclus."],
    "Get directions": ["Route planen", "Indicazioni stradali", "Itinéraire"],
    "ON THE ADRIATIC": ["AN DER ADRIA", "SULL’ADRIATICO", "SUR L’ADRIATIQUE"],
    "CONTACT": ["KONTAKT", "CONTATTI", "CONTACT"],
    "Reserve": ["Buchen Sie", "Prenota", "Réservez"],
    "your stay.": ["Ihren Aufenthalt.", "il tuo soggiorno.", "votre séjour."],
    "Book direct. Ask us for the best available rate.": ["Direkt buchen. Fragen Sie uns nach dem besten verfügbaren Preis.", "Prenota direttamente. Chiedici la migliore tariffa disponibile.", "Réservez en direct. Demandez-nous le meilleur tarif disponible."],
    "Email": ["E-Mail", "Email", "E-mail"],
    "Phone": ["Telefon", "Telefono", "Téléphone"],
    "Also available on": ["Auch buchbar auf", "Disponibile anche su", "Également disponible sur"],
    "Check availability": ["Verfügbarkeit anfragen", "Verifica disponibilità", "Voir les disponibilités"],
    "Your name": ["Ihr Name", "Il tuo nome", "Votre nom"],
    "Full name": ["Vor- und Nachname", "Nome e cognome", "Nom et prénom"],
    "(optional)": ["(optional)", "(facoltativo)", "(facultatif)"],
    "Arrival": ["Anreise", "Arrivo", "Arrivée"],
    "Departure": ["Abreise", "Partenza", "Départ"],
    "Your message": ["Ihre Nachricht", "Il tuo messaggio", "Votre message"],
    "Guests or questions": ["Gäste oder Fragen", "Ospiti o domande", "Voyageurs ou questions"],
    "Check availability on WhatsApp": ["Über WhatsApp anfragen", "Chiedi su WhatsApp", "Demander sur WhatsApp"],
    "Continue on WhatsApp": ["Weiter zu WhatsApp", "Continua su WhatsApp", "Continuer sur WhatsApp"],
    "Obala Maršala Tita 29 · 52221 Rabac, Croatia": ["Obala Maršala Tita 29 · 52221 Rabac, Kroatien", "Obala Maršala Tita 29 · 52221 Rabac, Croazia", "Obala Maršala Tita 29 · 52221 Rabac, Croatie"],
    "Mare Beachfront Apartment.": ["Mare Ferienwohnung am Meer.", "Mare Appartamento sul mare.", "Mare Appartement en bord de mer."],
    "Open WhatsApp with an inquiry about Mare": ["Anfrage zu Mare in WhatsApp öffnen", "Apri WhatsApp per informazioni su Mare", "Ouvrir WhatsApp pour une demande concernant Mare"],
    "Please choose a departure after your arrival.": ["Bitte wählen Sie ein Abreisedatum nach Ihrer Anreise.", "Scegli una data di partenza successiva all’arrivo.", "Veuillez choisir une date de départ après votre arrivée."],
    "Review and send your inquiry in WhatsApp.": ["Prüfen und senden Sie Ihre Anfrage in WhatsApp.", "Controlla e invia la richiesta su WhatsApp.", "Vérifiez et envoyez votre demande dans WhatsApp."],
    "Hello, I’m interested in the beachfront apartment in Rabac": ["Hallo, ich interessiere mich für die Ferienwohnung am Meer in Rabac.", "Buongiorno, mi interessa l’appartamento sul mare a Rabac.", "Bonjour, je suis intéressé(e) par l’appartement en bord de mer à Rabac."],
    "Hello, could you check availability and your best direct rate for Mare Beachfront Apartment?": ["Hallo, könnten Sie mir die Verfügbarkeit und Ihren besten Preis bei Direktbuchung für die Ferienwohnung Mare mitteilen?", "Buongiorno, potreste indicarmi la disponibilità e la migliore tariffa per una prenotazione diretta dell’appartamento Mare?", "Bonjour, pourriez-vous m’indiquer les disponibilités et votre meilleur tarif en réservation directe pour l’appartement Mare ?"],
    "Name": ["Name", "Nome", "Nom"],
    "Apartment terrace with shaded outdoor seating overlooking Rabac harbour and the Adriatic Sea": ["Terrasse mit schattigen Sitzplätzen und Blick auf den Hafen von Rabac und die Adria", "Terrazza con posti a sedere all’ombra e vista sul porto di Rabac e sull’Adriatico", "Terrasse avec des sièges à l’ombre et vue sur le port de Rabac et la mer Adriatique"],
    "Fully equipped kitchen and dining table beside the apartment living area": ["Voll ausgestattete Küche mit Esstisch im offenen Wohnbereich", "Cucina attrezzata e tavolo da pranzo nell’ambiente open space", "Cuisine tout équipée et table à manger dans la pièce de vie ouverte"],
    "Sofa and coffee table in the open-plan kitchen, dining and seating area": ["Sofa und Couchtisch im offenen Wohn-, Koch- und Essbereich", "Divano e tavolino nell’ambiente open space con cucina e zona pranzo", "Canapé et table basse dans la pièce de vie ouverte avec cuisine et coin repas"],
    "Double bedroom with bedside lights and a window overlooking Rabac": ["Schlafzimmer mit Doppelbett, Nachttischlampen und Fenster mit Blick auf Rabac", "Camera matrimoniale con lampade da comodino e finestra su Rabac", "Chambre double avec lampes de chevet et fenêtre donnant sur Rabac"],
    "Second double bedroom with bedside lamps and a seating area": ["Zweites Schlafzimmer mit Doppelbett, Nachttischlampen und Sitzecke", "Seconda camera matrimoniale con lampade da comodino e zona relax", "Seconde chambre double avec lampes de chevet et coin salon"],
    "Waterfront houses and the promenade seen from the beach in Rabac": ["Häuser am Wasser und Promenade, vom Strand in Rabac aus gesehen", "Case sul lungomare e passeggiata viste dalla spiaggia di Rabac", "Maisons du front de mer et promenade vues depuis la plage de Rabac"],
    "The house entrance and hallway with worn wooden stairs and a wooden banister": ["Hauseingang und Flur mit alten Holzstufen und Holzgeländer", "Ingresso e corridoio della casa con vecchie scale e corrimano in legno", "Entrée et couloir de la maison avec un ancien escalier et une rampe en bois"],
    "Historic postcard of Rabac harbour with sailing boats along the waterfront": ["Historische Postkarte des Hafens von Rabac mit Segelbooten am Ufer", "Cartolina storica del porto di Rabac con barche a vela sul lungomare", "Carte postale ancienne du port de Rabac avec des voiliers le long du front de mer"],
    "Historic panorama of Rabac, with waterfront houses below the hillside and sailing boats in the harbour": ["Historisches Panorama von Rabac mit Häusern am Wasser unterhalb des Hügels und Segelbooten im Hafen", "Panorama storico di Rabac con case sul lungomare ai piedi della collina e barche a vela nel porto", "Panorama ancien de Rabac, avec des maisons au bord de l’eau au pied de la colline et des voiliers dans le port"],
    "Historic view of boats moored beside the stone waterfront and houses in Rabac": ["Historische Ansicht von Booten am steinernen Kai und Häusern in Rabac", "Veduta storica delle barche ormeggiate lungo la banchina in pietra e delle case di Rabac", "Vue ancienne de bateaux amarrés le long du quai en pierre et des maisons de Rabac"],
    "Google Maps — Mare apartment, Obala Maršala Tita 29, Rabac": ["Google Maps – Ferienwohnung Mare, Obala Maršala Tita 29, Rabac", "Google Maps – Appartamento Mare, Obala Maršala Tita 29, Rabac", "Google Maps – Appartement Mare, Obala Maršala Tita 29, Rabac"],
    "Beachfront Apartment Rabac Labin – Sea View, 2 Bedrooms, Private Parking | Mare": ["Ferienwohnung am Meer in Rabac bei Labin – Meerblick, 2 Schlafzimmer, Privatparkplatz | Mare", "Appartamento sul mare a Rabac, Labin – Vista mare, 2 camere, parcheggio privato | Mare", "Appartement en bord de mer à Rabac, Labin – Vue mer, 2 chambres, parking privé | Mare"],
    "Mare Beachfront Apartment · Rabac": ["Mare Ferienwohnung am Meer · Rabac", "Mare Appartamento sul mare · Rabac", "Mare Appartement en bord de mer · Rabac"],
    "Discover Mare Beachfront Apartment in Rabac, near Labin, Istria. A peaceful apartment rental directly on the sea, with panoramic sea views, 2 bedrooms and free private parking.": ["Entdecken Sie die Ferienwohnung Mare in Rabac bei Labin, Istrien. Ruhig und direkt am Meer, mit Panoramablick, 2 Schlafzimmern und kostenlosem Privatparkplatz.", "Scopri l’appartamento Mare sul mare a Rabac, vicino a Labin, in Istria. Un soggiorno tranquillo con vista panoramica, 2 camere da letto e parcheggio privato gratuito.", "Découvrez l’appartement Mare en bord de mer à Rabac, près de Labin, en Istrie. Un séjour paisible face à la mer, avec vue panoramique, 2 chambres et parking privé gratuit."],
    "Beachfront apartment in Rabac, near Labin. Two bedrooms, a sea-view terrace and private parking.": ["Ferienwohnung direkt am Meer in Rabac bei Labin. Zwei Schlafzimmer, Terrasse mit Meerblick und Privatparkplatz.", "Appartamento sul mare a Rabac, vicino a Labin. Due camere da letto, terrazza vista mare e parcheggio privato.", "Appartement en bord de mer à Rabac, près de Labin. Deux chambres, une terrasse avec vue mer et un parking privé."],
  };
  // Translation columns: German, Italian, French.
  const localeColumns = { de: 0, it: 1, fr: 2 };
  const supportedLocales = ["en", ...Object.keys(localeColumns)];
  let locale = "en";
  const bindings = [];
  let onChange = () => {};
  const normalize = (value) => value.trim().replace(/\s+/g, " ");
  const t = (key) => locale === "en" ? key : translations[key]?.[localeColumns[locale]] ?? key;
  function setLocale(next, persist = true) {
    if (!supportedLocales.includes(next)) return;
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
    let saved;
    try { saved = localStorage.getItem("mare-locale"); } catch { /* Use browser preferences when storage is unavailable. */ }
    const preferredLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language || "en"];
    const detected = preferredLanguages
      .map((language) => language.toLowerCase().split(/[-_]/)[0])
      .find((language) => supportedLocales.includes(language)) || "en";
    // Only manual selections are saved; automatic detection follows browser preferences.
    setLocale(supportedLocales.includes(saved) ? saved : detected, false);
    document.querySelector(".language-picker").hidden = false;
  }
  return { t, init };
})();
