// Booking.com exports occupied nights as all-day events; DTEND is checkout
// (exclusive). Unsupported feeds fail closed instead of appearing available.
function calendarDate(value) {
  if (!/^\d{8}$/.test(value || "")) throw new Error("Unsupported date");
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== iso) {
    throw new Error("Invalid date");
  }
  return iso;
}

export function parseCalendar(source) {
  const lines = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "").trim().split("\n");
  if (lines[0] !== "BEGIN:VCALENDAR" || lines.at(-1) !== "END:VCALENDAR") {
    throw new Error("Invalid calendar");
  }
  const ranges = [];
  let event = null;
  for (const line of lines.slice(1, -1)) {
    if (!line) continue;
    if (line === "BEGIN:VEVENT") {
      if (event) throw new Error("Nested event");
      event = {};
    } else if (line === "END:VEVENT") {
      if (!event) throw new Error("Unmatched event");
      if (event.STATUS !== "CANCELLED" && event.TRANSP !== "TRANSPARENT") {
        if (event.unsupported) throw new Error("Unsupported event");
        const start = calendarDate(event.DTSTART);
        const end = calendarDate(event.DTEND);
        if (end <= start) throw new Error("Invalid interval");
        ranges.push({ start, end });
      }
      event = null;
    } else if (event) {
      const colon = line.indexOf(":");
      if (colon < 1) throw new Error("Invalid property");
      const name = line.slice(0, colon).split(";")[0].toUpperCase();
      if (["RRULE", "RDATE", "EXDATE", "RECURRENCE-ID"].includes(name)) event.unsupported = true;
      if (["DTSTART", "DTEND", "STATUS", "TRANSP"].includes(name)) {
        if (event[name] !== undefined) throw new Error("Duplicate property");
        event[name] = line.slice(colon + 1);
      }
    }
  }
  if (event) throw new Error("Incomplete event");
  ranges.sort((a, b) => a.start.localeCompare(b.start));
  const merged = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range.start <= previous.end) {
      if (range.end > previous.end) previous.end = range.end;
    } else merged.push({ ...range });
  }
  return merged;
}
