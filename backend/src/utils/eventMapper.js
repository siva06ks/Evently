function isoDateOnly(row) {
  if (row.event_date instanceof Date) {
    return row.event_date.toISOString().slice(0, 10);
  }
  if (typeof row.event_date === "string") {
    return row.event_date.slice(0, 10);
  }
  return String(row.event_date);
}

function formatWeekdayShort(isoYmd) {
  const d = new Date(`${isoYmd}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoYmd;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Prefer first time segment from "10:00 AM - 1:00 PM PDT" for list cards */
function firstTimeSegment(timeRange) {
  if (!timeRange || typeof timeRange !== "string") return "";
  const beforeDash = timeRange.split("-")[0]?.trim() ?? "";
  return beforeDash || timeRange.trim();
}

function buildDateLabel(row) {
  const iso = isoDateOnly(row);
  const short = formatWeekdayShort(iso);
  const timeBit = firstTimeSegment(row.time_range);
  if (timeBit) return `${short} • ${timeBit}`;
  return short;
}

/** Maps a DB row to the mobile-facing API shape (camelCase). */
function toEvent(row) {
  if (!row) return null;

  const dateStr = isoDateOnly(row);

  let createdAt;
  if (row.created_at instanceof Date) {
    createdAt = row.created_at.toISOString();
  } else if (row.created_at) {
    createdAt = new Date(row.created_at).toISOString();
  }

  const base = {
    id: row.id,
    title: row.title,
    organizerEmail: row.organizer_email,
    date: dateStr,
    category: row.category ?? "Social",
    location: row.location ?? "",
    description: row.description ?? "",
    priceLabel: row.price_label ?? "Free",
    summary: row.summary ?? null,
    dateDetail: row.date_detail ?? null,
    timeRange: row.time_range ?? null,
    aboutLong: row.about_long ?? null,
    heroImageUrl: row.hero_image_url ?? null,
    mapImageUrl: row.map_image_url ?? null,
    organizerName: row.organizer_name ?? null,
    organizerAvatarUrl: row.organizer_avatar_url ?? null,
    dateLabel: buildDateLabel(row),
    ...(createdAt && { createdAt }),
  };

  return base;
}

module.exports = { toEvent, isoDateOnly };
