window.MareCalendar = (() => {
  const container = document.getElementById("availability-calendar");
  const monthLabel = document.getElementById("calendar-month");
  const status = document.getElementById("calendar-status");
  const content = document.getElementById("calendar-content");
  const retry = document.getElementById("calendar-retry");
  const previous = document.getElementById("calendar-prev");
  const next = document.getElementById("calendar-next");
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
  function render() {
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
    const days = document.getElementById("calendar-days");
    days.replaceChildren();
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
        cell.textContent = day;
        cell.className = past ? "calendar-past" : blocked ? "calendar-blocked" : "calendar-unblocked";
        cell.setAttribute("aria-label", `${new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }).format(date)}: ${t(past ? "Past date" : blocked ? "Unavailable" : "No block shown")}`);
        if (iso === now) cell.setAttribute("aria-current", "date");
      }
      days.lastChild.append(cell);
    }
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
  return { render };
})();
