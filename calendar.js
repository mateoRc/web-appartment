window.MareCalendar = (() => {
  const container = document.getElementById("availability-calendar");
  const monthLabel = document.getElementById("calendar-month");
  const status = document.getElementById("calendar-status");
  const content = document.getElementById("calendar-content");
  const retry = document.getElementById("calendar-retry");
  const previous = document.getElementById("calendar-prev");
  const next = document.getElementById("calendar-next");
  const picker = document.getElementById("calendar-picker");
  const monthWheel = document.getElementById("calendar-month-wheel");
  const yearWheel = document.getElementById("calendar-year-wheel");
  const pickerDone = document.getElementById("calendar-picker-done");
  let pickerOffset = 0;
  let pickerMonths = [];
  const wheelTimers = new Map();
  const form = document.getElementById("booking-form");
  const arrival = form.elements.arrival;
  const departure = form.elements.departure;
  const days = document.getElementById("calendar-days");
  let anchor = null;
  let drag = null;
  let buttons = [];
  const t = (key) => window.MareLocale.t(key);
  const today = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zagreb", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  let offset = 0;
  let data = null;
  let state = "idle";
  let expiryTimer;
  let expiresAt = 0;
  const fresh = () => data && performance.now() < expiresAt;
  function closePicker(restoreFocus = false) {
    picker.hidden = true;
    monthLabel.setAttribute("aria-expanded", "false");
    for (const timer of wheelTimers.values()) clearTimeout(timer);
    if (restoreFocus) monthLabel.focus();
  }
  function fillWheel(wheel, options, selected, onSelect) {
    clearTimeout(wheelTimers.get(wheel));
    wheel.replaceChildren();
    const select = (index) => {
      if (picker.hidden || index === selected) return;
      selected = index;
      [...wheel.children].forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      onSelect(options[index].value);
    };
    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.setAttribute("aria-pressed", String(index === selected));
      button.addEventListener("click", () => {
        wheel.scrollTop = index * 40;
        select(index);
      });
      button.addEventListener("keydown", (event) => {
        if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
          : Math.max(0, Math.min(options.length - 1, index + (event.key === "ArrowUp" ? -1 : 1)));
        wheel.scrollTop = target * 40;
        select(target);
        wheel.children[target].focus({ preventScroll: true });
      });
      wheel.append(button);
    });
    wheel.scrollTop = selected * 40;
    wheel.onscroll = () => {
      clearTimeout(wheelTimers.get(wheel));
      wheelTimers.set(wheel, setTimeout(() => {
        select(Math.max(0, Math.min(options.length - 1, Math.round(wheel.scrollTop / 40))));
      }, 120));
    };
  }
  function fillMonths() {
    const selected = pickerMonths[pickerOffset];
    const options = pickerMonths.filter((date) => date.getUTCFullYear() === selected.getUTCFullYear())
      .map((date) => ({ value: pickerMonths.indexOf(date), label: new Intl.DateTimeFormat(document.documentElement.lang,
        { month: "long", timeZone: "UTC" }).format(date) }));
    fillWheel(monthWheel, options, options.findIndex((option) => option.value === pickerOffset),
      (value) => { pickerOffset = value; });
  }
  function openPicker() {
    pickerOffset = offset;
    pickerMonths = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(`${today().slice(0, 7)}-01T00:00:00Z`);
      date.setUTCMonth(date.getUTCMonth() + index);
      return date;
    });
    picker.hidden = false;
    monthLabel.setAttribute("aria-expanded", "true");
    fillMonths();
    const years = [...new Set(pickerMonths.map((date) => date.getUTCFullYear()))];
    fillWheel(yearWheel, years.map((year) => ({ value: year, label: String(year) })),
      years.indexOf(pickerMonths[pickerOffset].getUTCFullYear()), (year) => {
        const month = pickerMonths[pickerOffset].getUTCMonth();
        const candidates = pickerMonths.map((date, index) => ({ date, index }))
          .filter(({ date }) => date.getUTCFullYear() === year);
        pickerOffset = candidates.reduce((best, item) =>
          Math.abs(item.date.getUTCMonth() - month) < Math.abs(best.date.getUTCMonth() - month) ? item : best).index;
        fillMonths();
      });
    // Focus the selected month without scrolling the page.
    monthWheel.children[[...monthWheel.children].findIndex((button) => button.getAttribute("aria-pressed") === "true")].focus({ preventScroll: true });
  }
  monthLabel.addEventListener("click", () => picker.hidden ? openPicker() : closePicker());
  pickerDone.addEventListener("click", () => {
    // Read the resting wheel positions even if the scroll debounce has not fired yet.
    const yearIndex = Math.round(yearWheel.scrollTop / 40);
    yearWheel.children[yearIndex]?.click();
    const monthIndex = Math.round(monthWheel.scrollTop / 40);
    monthWheel.children[monthIndex]?.click();
    offset = pickerOffset;
    closePicker(true);
    render();
  });
  picker.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closePicker(true); }
  });
  document.addEventListener("click", (event) => {
    if (!picker.hidden && !picker.contains(event.target) && event.target !== monthLabel) closePicker();
  });
  container.addEventListener("focusout", (event) => {
    if (!container.contains(event.relatedTarget)) closePicker();
  });
  const available = (date) => fresh() && date >= today() &&
    !data.blocked.some((range) => date >= range.start && date < range.end);
  const validRange = (start, end) => available(start) && available(end) &&
    !data.blocked.some((range) => range.start <= end && range.end > start);
  function selectionError() {
    if (!fresh()) return "";
    const start = arrival.value;
    const end = departure.value;
    return (start && !available(start)) || (end && !available(end)) ||
      (start && end && end > start && !validRange(start, end))
      ? t("Please choose only available dates.") : "";
  }
  function paint(start = arrival.value, end = departure.value) {
    const valid = start && end && end > start && validRange(start, end);
    for (const button of buttons) {
      const selected = available(button.dataset.date) &&
        (valid ? button.dataset.date >= start && button.dataset.date <= end : button.dataset.date === start);
      button.classList.toggle("calendar-selected", Boolean(selected));
      button.setAttribute("aria-pressed", String(Boolean(selected)));
    }
  }
  function choose(date) {
    if (!available(date)) return;
    if (anchor && date !== anchor) {
      const [start, end] = [anchor, date].sort();
      if (!validRange(start, end)) return;
      arrival.value = start;
      departure.value = end;
      anchor = null;
    } else {
      anchor = date;
      arrival.value = date;
      departure.value = "";
    }
    arrival.dispatchEvent(new Event("change", { bubbles: true }));
    departure.dispatchEvent(new Event("change", { bubbles: true }));
    paint();
  }
  days.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button[data-date]");
    if (event.button !== 0 || !button || !available(button.dataset.date)) return;
    drag = { pointer: event.pointerId, start: button.dataset.date, end: button.dataset.date };
    days.setPointerCapture(event.pointerId);
  });
  days.addEventListener("pointermove", (event) => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const button = document.elementFromPoint(event.clientX, event.clientY)?.closest("button[data-date]");
    drag.end = button && days.contains(button) ? button.dataset.date : null;
    const [start, end] = [drag.start, drag.end || drag.start].sort();
    if (drag.end && validRange(start, end)) paint(start, end);
    else paint();
  });
  days.addEventListener("pointerup", (event) => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const { start, end } = drag;
    drag = null;
    if (end === start) choose(start);
    else if (end && validRange(...[start, end].sort())) {
      anchor = start;
      choose(end);
    }
    paint();
  });
  const cancelDrag = () => { drag = null; paint(); };
  days.addEventListener("pointercancel", cancelDrag);
  days.addEventListener("lostpointercapture", cancelDrag);
  days.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-date]");
    if (event.detail === 0 && button) choose(button.dataset.date);
  });
  for (const input of [arrival, departure]) {
    input.addEventListener("input", () => { anchor = null; paint(); });
    input.addEventListener("change", () => paint());
  }
  function render() {
    closePicker();
    const locale = document.documentElement.lang;
    const now = today();
    const month = new Date(`${now.slice(0, 7)}-01T00:00:00Z`);
    month.setUTCMonth(month.getUTCMonth() + offset);
    monthLabel.textContent = new Intl.DateTimeFormat(locale, {
      month: "long", year: "numeric", timeZone: "UTC",
    }).format(month);
    previous.disabled = offset === 0;
    next.disabled = offset === 11;
    content.hidden = !fresh();
    retry.hidden = state !== "error";
    if (content.hidden) {
      status.textContent = t(state === "error"
        ? "Calendar unavailable. Please ask us about your dates."
        : "Loading calendar…");
      return;
    }
    status.textContent = `${t("Last checked")}: ${new Intl.DateTimeFormat(locale, {
      dateStyle: "short", timeStyle: "short",
    }).format(new Date(data.fetchedAt))}`;
    const weekdays = document.getElementById("calendar-weekdays");
    const row = document.createElement("tr");
    for (let day = 0; day < 7; day++) {
      const th = document.createElement("th");
      th.scope = "col";
      const date = new Date(Date.UTC(2024, 0, 1 + day));
      th.textContent = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date);
      row.append(th);
    }
    weekdays.replaceChildren(row);
    days.replaceChildren();
    buttons = [];
    const first = (month.getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
    for (let index = 0; index < Math.ceil((first + count) / 7) * 7; index++) {
      if (index % 7 === 0) days.append(document.createElement("tr"));
      const cell = document.createElement("td");
      const day = index - first + 1;
      if (day > 0 && day <= count) {
        const date = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day));
        const iso = date.toISOString().slice(0, 10);
        const past = iso < now;
        const blocked = data.blocked.some((range) => iso >= range.start && iso < range.end);
        cell.className = past ? "calendar-past" : blocked ? "calendar-blocked" : "calendar-unblocked";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = day;
        button.dataset.date = iso;
        button.disabled = past || blocked;
        button.setAttribute("aria-label", `${new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }).format(date)}: ${t(past ? "Past date" : blocked ? "Unavailable" : "Available")}`);
        cell.append(button);
        buttons.push(button);
        if (iso === now) cell.setAttribute("aria-current", "date");
      }
      days.lastChild.append(cell);
    }
    paint();
    departure.dispatchEvent(new Event("change", { bubbles: true }));
  }
  async function fetchCalendar() {
    // AbortSignal.timeout is unavailable in some older mobile browsers.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const started = performance.now();
    try {
      const response = await fetch("/api/availability", { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json();
      // Use the server clock so a phone's clock cannot reject a fresh response.
      // Include cache age, transfer time and HTTP Date's one-second precision.
      const serverTime = Date.parse(response.headers.get("Date"));
      const cacheAge = Number(response.headers.get("Age") || 0) * 1000;
      const age = (Number.isFinite(serverTime) ? serverTime : Date.now()) - Date.parse(result.fetchedAt)
        + cacheAge + performance.now() - started + 1000;
      if (!Number.isFinite(age) || age < -60000 || age >= 600000 || !Array.isArray(result.blocked) ||
          !result.blocked.every((range) => range && /^\d{4}-\d{2}-\d{2}$/.test(range.start) && /^\d{4}-\d{2}-\d{2}$/.test(range.end) && range.end > range.start)) {
        throw new Error("Invalid calendar");
      }
      return { result, remaining: 600000 - Math.max(0, age) };
    } finally {
      clearTimeout(timeout);
    }
  }
  async function load() {
    if (state === "loading") return;
    if (fresh()) { render(); return; }
    state = "loading";
    render();
    try {
      let fetched;
      try {
        fetched = await fetchCalendar();
      } catch {
        // One short automatic retry recovers from transient network/feed failures.
        await new Promise((resolve) => setTimeout(resolve, 500));
        fetched = await fetchCalendar();
      }
      data = fetched.result;
      expiresAt = performance.now() + fetched.remaining;
      state = "ready";
      clearTimeout(expiryTimer);
      expiryTimer = setTimeout(() => { data = null; state = "idle"; if (container.open) load(); }, fetched.remaining);
    } catch {
      data = null;
      state = "error";
    }
    render();
  }
  container.addEventListener("toggle", () => { if (container.open) load(); });
  retry.addEventListener("click", load);
  previous.addEventListener("click", () => { offset = Math.max(0, offset - 1); render(); });
  next.addEventListener("click", () => { offset = Math.min(11, offset + 1); render(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && container.open) load(); });
  container.hidden = false;
  if (container.open) load();
  return { render, selectionError };
})();
