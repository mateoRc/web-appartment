import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("./calendar.js", import.meta.url), "utf8");
function element() {
  return {
    hidden: true, open: true, children: [], listeners: {}, dataset: {}, value: "",
    classList: { toggle() {} },
    addEventListener(name, callback) {
      const previous = this.listeners[name];
      this.listeners[name] = (event) => { previous?.(event); callback(event); };
    },
    dispatchEvent(event) { this.listeners[event.type]?.(event); },
    closest() { return this.dataset.date ? this : null; },
    contains(target) { return this.children.some((child) => child === target || child.contains(target)); },
    setPointerCapture() {},
    append(child) { this.children.push(child); this.lastChild = child; },
    replaceChildren(...children) { this.children = children; },
    setAttribute() {},
  };
}
async function browser(fetcher, clockOffset = 0) {
  const elements = new Map();
  const form = element();
  form.elements = { arrival: element(), departure: element() };
  elements.set("booking-form", form);
  const document = {
    documentElement: { lang: "en" },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    createElement: element, addEventListener() {},
    elementFromPoint() { return document.hit; },
  };
  class DeviceDate extends Date {
    static now() { return Date.now() + clockOffset; }
  }
  const calls = [];
  const window = { MareLocale: { t: (key) => key } };
  vm.runInNewContext(source, {
    window, document, Event,
    Date: DeviceDate, Intl, performance, AbortController,
    // Deliberately omit AbortSignal.timeout to cover older mobile browsers.
    setTimeout(callback, delay) { if (delay === 500) queueMicrotask(callback); return 1; },
    clearTimeout() {},
    fetch: async (...args) => { calls.push(args); return fetcher(calls.length); },
  });
  await new Promise((resolve) => setImmediate(resolve));
  return { elements, calls, document, calendar: window.MareCalendar, inputs: form.elements };
}
function response(age = 0) {
  return new Response(JSON.stringify({
    blocked: [{ start: "2030-06-10", end: "2030-06-13" }],
    fetchedAt: new Date(Date.now() - age).toISOString(),
  }), { headers: { Date: new Date().toUTCString() } });
}

test("open calendar loads automatically without browser caching or AbortSignal.timeout", async () => {
  const { elements, calls } = await browser(() => response());
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].cache, "no-store");
  assert.equal(elements.get("availability-calendar").hidden, false);
  assert.equal(elements.get("calendar-content").hidden, false);
  assert.ok(elements.get("calendar-days").children.length >= 4);
});

function nextMonthDates() {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const prefix = date.toISOString().slice(0, 7);
  return (day) => `${prefix}-${String(day).padStart(2, "0")}`;
}
async function selectableCalendar() {
  const date = nextMonthDates();
  const app = await browser(() => new Response(JSON.stringify({
    blocked: [{ start: date(10), end: date(13) }], fetchedAt: new Date().toISOString(),
  }), { headers: { Date: new Date().toUTCString() } }));
  app.elements.get("calendar-next").listeners.click();
  const days = app.elements.get("calendar-days");
  const button = (day) => days.children.flatMap((row) => row.children)
    .flatMap((cell) => cell.children).find((item) => item.dataset.date === date(day));
  const click = (day) => days.listeners.click({ target: button(day), detail: 0 });
  const drag = (start, end) => {
    days.listeners.pointerdown({ target: button(start), button: 0, pointerId: 1 });
    app.document.hit = button(end);
    days.listeners.pointermove({ pointerId: 1, clientX: 0, clientY: 0 });
    days.listeners.pointerup({ pointerId: 1 });
  };
  return { ...app, date, button, click, drag, days };
}
test("drag selects available endpoints in either direction and rejects reserved ranges", async () => {
  const { inputs, date, drag, button } = await selectableCalendar();
  assert.equal(button(10).disabled, true);
  drag(3, 7);
  assert.equal(inputs.arrival.value, date(3));
  assert.equal(inputs.departure.value, date(7));
  drag(8, 4);
  assert.equal(inputs.arrival.value, date(4));
  assert.equal(inputs.departure.value, date(8));
  for (const end of [10, 14]) {
    drag(5, end);
    assert.equal(inputs.arrival.value, date(4));
    assert.equal(inputs.departure.value, date(8));
  }
});
test("keyboard selection and manual validation exclude blocked endpoints and interior dates", async () => {
  const { inputs, date, click, calendar } = await selectableCalendar();
  click(3);
  click(7);
  assert.equal(inputs.arrival.value, date(3));
  assert.equal(inputs.departure.value, date(7));
  assert.equal(calendar.selectionError(), "");
  for (const end of [10, 14]) {
    inputs.departure.value = date(end);
    assert.match(calendar.selectionError(), /only available/);
  }
  inputs.arrival.value = date(13);
  inputs.departure.value = date(15);
  assert.equal(calendar.selectionError(), "");
});
test("cancelled drags preserve values and two clicks can select across months", async () => {
  const { inputs, date, click, days, button, elements } = await selectableCalendar();
  click(14);
  click(16);
  days.listeners.pointerdown({ target: button(18), button: 0, pointerId: 1 });
  days.listeners.pointercancel();
  days.listeners.pointerup({ pointerId: 1 });
  assert.equal(inputs.arrival.value, date(14));
  assert.equal(inputs.departure.value, date(16));
  click(20);
  elements.get("calendar-next").listeners.click();
  const nextButton = days.children.flatMap((row) => row.children)
    .flatMap((cell) => cell.children).find((item) => item.textContent === 3);
  days.listeners.click({ target: nextButton, detail: 0 });
  assert.equal(inputs.arrival.value, date(20));
  assert.equal(inputs.departure.value, nextButton.dataset.date);
});

test("one transient failure recovers automatically", async () => {
  const { elements, calls } = await browser((attempt) => attempt === 1
    ? new Response("unavailable", { status: 503 }) : response());
  assert.equal(calls.length, 2);
  assert.equal(elements.get("calendar-content").hidden, false);
  assert.equal(elements.get("calendar-retry").hidden, true);
});

test("fresh server data remains usable when the device clock is incorrect", async () => {
  for (const offset of [-3600000, 3600000]) {
    const { elements } = await browser(() => response(), offset);
    assert.equal(elements.get("calendar-content").hidden, false);
  }
});

test("stale data and repeated failures still show a retry instead of available dates", async () => {
  for (const fetcher of [() => response(660000), () => { throw new Error("offline"); }]) {
    const { elements, calls } = await browser(fetcher);
    assert.equal(calls.length, 2);
    assert.equal(elements.get("calendar-content").hidden, true);
    assert.equal(elements.get("calendar-retry").hidden, false);
    assert.match(elements.get("calendar-status").textContent, /Calendar unavailable/);
  }
});
