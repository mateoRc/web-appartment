// Replace these values with the owner's contact details before publishing.
const CONTACT = { whatsapp: '', email: '', phone: '' };
const greeting = 'Hello, I’m interested in the beachfront apartment in Rabac';
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  link.href = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(greeting)}`;
});
if (CONTACT.email) {
  const email = document.querySelector('[data-email]');
  email.textContent = CONTACT.email;
  email.href = `mailto:${CONTACT.email}`;
}
if (CONTACT.phone) {
  const phone = document.querySelector('[data-phone]');
  const link = document.createElement('a');
  link.href = `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}`;
  link.textContent = CONTACT.phone;
  phone.replaceWith(link);
}
if (CONTACT.whatsapp && CONTACT.email && CONTACT.phone) document.querySelector('.contact-note').hidden = true;
document.getElementById('year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const lightbox = document.getElementById('lightbox');
const photos = [...document.querySelectorAll('[data-photo]')];
let currentPhoto = 0;
let previousOverflow = '';
function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const source = photos[currentPhoto];
  lightbox.querySelector('img').src = source.dataset.photo;
  lightbox.querySelector('img').alt = source.querySelector('img').alt;
  lightbox.querySelector('figcaption').textContent = `${currentPhoto + 1} / ${photos.length} — ${source.dataset.caption}`;
}
photos.forEach((button, index) => button.addEventListener('click', () => {
  showPhoto(index);
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  lightbox.showModal();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(currentPhoto + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(currentPhoto - 1); }
});
const form = document.getElementById('booking-form');
const arrival = form.elements.arrival;
const departure = form.elements.departure;
function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
arrival.min = localDate(new Date());
function validateDates() {
  const date = arrival.value ? new Date(`${arrival.value}T12:00:00`) : new Date();
  date.setDate(date.getDate() + 1);
  departure.min = localDate(date);
  departure.setCustomValidity(departure.value && arrival.value && departure.value <= arrival.value ? 'Please choose a departure after your arrival.' : '');
}
arrival.addEventListener('change', validateDates);
departure.addEventListener('change', validateDates);
validateDates();
form.addEventListener('submit', event => {
  event.preventDefault();
  validateDates();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `Hello, I’m interested in Mare Beachfront Apartment in Rabac.\n\nName: ${data.get('name').trim()}\nEmail: ${data.get('email')}\nArrival: ${data.get('arrival')}\nDeparture: ${data.get('departure')}\n\n${data.get('message').trim()}`;
  const status = document.getElementById('form-status');
  status.hidden = false;
  const draft = document.getElementById('email-draft');
  if (CONTACT.email) {
    status.textContent = 'Your inquiry is ready. Open the email draft below to review and send it. Nothing has been sent yet.';
    draft.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Mare apartment — stay inquiry')}&body=${encodeURIComponent(message)}`;
    draft.hidden = false;
  } else {
    status.textContent = `Your inquiry is ready below. Booking contact details are coming soon; this message has not been sent.\n\n${message}`;
    draft.hidden = true;
  }
});
