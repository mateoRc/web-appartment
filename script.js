// Owner contact details. Keep the HTML fallback links in sync when updating.
const t = (key) => window.MareLocale.t(key);
const CONTACT = {
  whatsapp: "385981700612",
  email: "marizahm305@gmail.com",
  phone: "+385 98 170 0612",
};
const greeting = "Hello, I’m interested in the beachfront apartment in Rabac";
const whatsappUrl = (message) =>
  `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsappUrl(greeting);
});
if (CONTACT.email) {
  const email = document.querySelector("[data-email]");
  email.textContent = CONTACT.email;
  email.href = `mailto:${CONTACT.email}`;
}
if (CONTACT.phone) {
  const phone = document.querySelector("[data-phone]");
  const link = document.createElement("a");
  link.href = `tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`;
  link.textContent = CONTACT.phone;
  phone.replaceWith(link);
}
document.getElementById("year").textContent = new Date().getFullYear();
const header = document.querySelector(".header");
function updateHeader() {
  // Separate thresholds keep the transition steady near the top.
  const compact = header.classList.contains("is-compact");
  header.classList.toggle("is-compact", compact ? window.scrollY > 12 : window.scrollY > 48);
}
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("pageshow", updateHeader);
updateHeader();
const toggle = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");
function closeMenu() {
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", t("Open navigation"));
  navigation.classList.remove("open");
}
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute(
    "aria-label",
    t(open ? "Close navigation" : "Open navigation"),
  );
  navigation.classList.toggle("open", open);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header")) closeMenu();
});
if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => observer.observe(element));
}

// Small background offsets only; native scrolling stays untouched.
const ambientMotion = matchMedia(
  "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
);
const scenes = [...document.querySelectorAll(".hero, .tide-divider")];
let stopAmbientMotion = () => {};
function setupAmbientMotion() {
  stopAmbientMotion();
  scenes.forEach((scene) => scene.style.removeProperty("--drift"));
  if (!ambientMotion.matches || !("IntersectionObserver" in window)) return;
  const visibleScenes = new Set();
  let frame = 0;
  const render = () => {
    frame = 0;
    visibleScenes.forEach((scene) => {
      const box = scene.getBoundingClientRect();
      const offset = (innerHeight / 2 - box.top - box.height / 2) * 0.065;
      scene.style.setProperty(
        "--drift",
        `${Math.max(-28, Math.min(28, offset)).toFixed(1)}px`,
      );
    });
  };
  const schedule = () => {
    if (!frame && visibleScenes.size) frame = requestAnimationFrame(render);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) =>
      entry.isIntersecting
        ? visibleScenes.add(entry.target)
        : visibleScenes.delete(entry.target),
    );
    schedule();
  });
  scenes.forEach((scene) => observer.observe(scene));
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  stopAmbientMotion = () => {
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    cancelAnimationFrame(frame);
  };
}
ambientMotion.addEventListener("change", setupAmbientMotion);
setupAmbientMotion();

const lightbox = document.getElementById("lightbox");
const photos = [...document.querySelectorAll("[data-photo]")];
const galleryTrack = document.getElementById("apartment-photos");
const galleryNavigation = document.querySelector(".gallery-navigation");
const galleryBack = galleryNavigation.querySelector(".gallery-back");
const galleryForward = galleryNavigation.querySelector(".gallery-forward");
let galleryIndex = 0;
function updateGalleryPosition() {
  const left = galleryTrack.getBoundingClientRect().left;
  galleryIndex = photos.reduce((closest, photo, index) =>
    Math.abs(photo.getBoundingClientRect().left - left) <
    Math.abs(photos[closest].getBoundingClientRect().left - left) ? index : closest, 0);
  galleryNavigation.querySelector(".gallery-position").textContent =
    `${galleryIndex + 1} / ${photos.length}`;
  galleryBack.disabled = galleryIndex === 0;
  galleryForward.disabled = galleryIndex === photos.length - 1;
}
function moveGallery(direction) {
  const index = Math.max(0, Math.min(photos.length - 1, galleryIndex + direction));
  galleryTrack.scrollTo({
    left: galleryTrack.scrollLeft + photos[index].getBoundingClientRect().left - galleryTrack.getBoundingClientRect().left,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}
galleryBack.addEventListener("click", () => moveGallery(-1));
galleryForward.addEventListener("click", () => moveGallery(1));
galleryTrack.addEventListener("scroll", updateGalleryPosition, { passive: true });
window.addEventListener("resize", updateGalleryPosition);
galleryNavigation.hidden = false;
updateGalleryPosition();
let currentPhoto = 0;
let previousOverflow = "";
function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const source = photos[currentPhoto];
  lightbox.querySelector("img").src = source.dataset.photo;
  lightbox.querySelector("img").alt = source.querySelector("img").alt;
  lightbox.querySelector("figcaption").textContent =
    `${currentPhoto + 1} / ${photos.length} — ${source.dataset.caption}`;
}
photos.forEach((button, index) =>
  button.addEventListener("click", () => {
    showPhoto(index);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightbox.showModal();
  }),
);
lightbox
  .querySelector(".lightbox-close")
  .addEventListener("click", () => lightbox.close());
lightbox
  .querySelector(".lightbox-prev")
  .addEventListener("click", () => showPhoto(currentPhoto - 1));
lightbox
  .querySelector(".lightbox-next")
  .addEventListener("click", () => showPhoto(currentPhoto + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => {
  document.body.style.overflow = previousOverflow;
});
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(currentPhoto + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPhoto(currentPhoto - 1);
  }
});
const form = document.getElementById("booking-form");
const arrival = form.elements.arrival;
const departure = form.elements.departure;
function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
arrival.min = localDate(new Date());
function validateDates() {
  const date = arrival.value
    ? new Date(`${arrival.value}T12:00:00`)
    : new Date();
  date.setDate(date.getDate() + 1);
  departure.min = localDate(date);
  departure.setCustomValidity(
    departure.value && arrival.value && departure.value <= arrival.value
      ? t("Please choose a departure after your arrival.")
      : "",
  );
}
arrival.addEventListener("change", validateDates);
departure.addEventListener("change", validateDates);
validateDates();
function inquiryMessage() {
  const data = new FormData(form);
  const email = data.get("email").trim();
  return `${t("Hello, could you check availability and your best direct rate for Mare Beachfront Apartment?")}\n\n${t("Name")}: ${data.get("name").trim()}${email ? `\n${t("Email")}: ${email}` : ""}\n${t("Arrival")}: ${data.get("arrival")}\n${t("Departure")}: ${data.get("departure")}\n\n${data.get("message").trim()}`;
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  validateDates();
  if (!form.reportValidity()) return;
  const message = inquiryMessage();
  const status = document.getElementById("form-status");
  status.hidden = false;
  const draft = document.getElementById("whatsapp-draft");
  draft.href = whatsappUrl(message);
  draft.hidden = false;
  status.textContent = t("Review and send your inquiry in WhatsApp.");
  window.open(draft.href, "_blank", "noopener,noreferrer");
});
window.MareLocale.init(() => {
  window.MareCalendar.render();
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = whatsappUrl(t(greeting));
  });
  toggle.setAttribute("aria-label", t(toggle.getAttribute("aria-expanded") === "true" ? "Close navigation" : "Open navigation"));
  validateDates();
  if (lightbox.open) showPhoto(currentPhoto);
  const draft = document.getElementById("whatsapp-draft");
  if (!draft.hidden) {
    draft.href = whatsappUrl(inquiryMessage());
    document.getElementById("form-status").textContent = t("Review and send your inquiry in WhatsApp.");
  }
});
