const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TITLE_RE = /^[A-Za-z0-9 ]{3,60}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const CATEGORIES = new Set(["Arts", "Health", "Social", "Learning", "Technology"]);

function isRealCalendarDateYmd(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function validateCreateBody(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const organizerEmail =
    typeof body.organizerEmail === "string" ? body.organizerEmail.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";

  const errors = [];
  if (!TITLE_RE.test(title)) {
    errors.push("title must be 3-60 letters, numbers, or spaces");
  }
  if (!EMAIL_RE.test(organizerEmail)) {
    errors.push("organizerEmail must be a valid email");
  }
  if (!ISO_DATE_RE.test(date)) {
    errors.push("date must be YYYY-MM-DD");
  } else if (!isRealCalendarDateYmd(date)) {
    errors.push("date is not a valid calendar date");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, title, organizerEmail, date };
}

function pickCategory(raw) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (CATEGORIES.has(s)) return s;
  return "Social";
}

function optStr(v, fallback = "") {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  return t.length ? t : fallback;
}

function optStrNullable(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

/**
 * Full create payload for Warmth UI + defaults from authenticated user identifier.
 * @returns {{ ok: true, payload: object } | { ok: false, errors: string[] }}
 */
function validateRichCreate(body, identifier) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const errors = [];
  if (!TITLE_RE.test(title)) {
    errors.push("title must be 3-60 letters, numbers, or spaces");
  }
  if (!ISO_DATE_RE.test(date)) {
    errors.push("date must be YYYY-MM-DD");
  } else if (!isRealCalendarDateYmd(date)) {
    errors.push("date is not a valid calendar date");
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  let organizerEmail =
    typeof body.organizerEmail === "string" ? body.organizerEmail.trim() : "";
  if (!organizerEmail && typeof identifier === "string" && identifier.trim()) {
    const idf = identifier.trim();
    if (EMAIL_RE.test(idf)) {
      organizerEmail = idf;
    } else {
      const safe = idf.replace(/[^\d+]/g, "") || "user";
      organizerEmail = `organizer-${safe}@phone.evently.app`;
    }
  }
  if (!EMAIL_RE.test(organizerEmail)) {
    return {
      ok: false,
      errors: ["organizer email could not be set; add organizerEmail in the request body"],
    };
  }

  const category = pickCategory(body.category);
  const location = optStr(body.location, "");
  const description = optStr(body.description, "");
  const priceLabel = optStr(body.priceLabel, "$10");
  const summary = optStrNullable(body.summary);
  const dateDetail = optStrNullable(body.dateDetail);
  const timeRange = optStrNullable(body.timeRange);
  const aboutLong = optStrNullable(body.aboutLong);
  const heroImageUrl = optStrNullable(body.heroImageUrl);
  const mapImageUrl = optStrNullable(body.mapImageUrl);
  const organizerName = optStrNullable(body.organizerName);
  const organizerAvatarUrl = optStrNullable(body.organizerAvatarUrl);

  return {
    ok: true,
    payload: {
      title,
      organizerEmail,
      date,
      category,
      location,
      description,
      priceLabel,
      summary,
      dateDetail,
      timeRange,
      aboutLong,
      heroImageUrl,
      mapImageUrl,
      organizerName,
      organizerAvatarUrl,
    },
  };
}

function validatePatchBody(body) {
  const patch = {};
  const errors = [];

  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!TITLE_RE.test(title)) errors.push("title must be 3-60 letters, numbers, or spaces");
    else patch.title = title;
  }

  if (body.organizerEmail !== undefined) {
    const organizerEmail =
      typeof body.organizerEmail === "string" ? body.organizerEmail.trim() : "";
    if (!EMAIL_RE.test(organizerEmail)) errors.push("organizerEmail must be valid");
    else patch.organizerEmail = organizerEmail;
  }

  if (body.date !== undefined) {
    const date = typeof body.date === "string" ? body.date.trim() : "";
    if (!ISO_DATE_RE.test(date) || !isRealCalendarDateYmd(date)) {
      errors.push("date must be a valid YYYY-MM-DD");
    } else {
      patch.date = date;
    }
  }

  if (body.category !== undefined) {
    patch.category = pickCategory(body.category);
  }

  if (body.location !== undefined) patch.location = optStr(body.location, "");
  if (body.description !== undefined) patch.description = optStr(body.description, "");
  if (body.priceLabel !== undefined) patch.priceLabel = optStr(body.priceLabel, "Free");

  if (body.summary !== undefined) patch.summary = optStrNullable(body.summary);
  if (body.dateDetail !== undefined) patch.dateDetail = optStrNullable(body.dateDetail);
  if (body.timeRange !== undefined) patch.timeRange = optStrNullable(body.timeRange);
  if (body.aboutLong !== undefined) patch.aboutLong = optStrNullable(body.aboutLong);
  if (body.heroImageUrl !== undefined) patch.heroImageUrl = optStrNullable(body.heroImageUrl);
  if (body.mapImageUrl !== undefined) patch.mapImageUrl = optStrNullable(body.mapImageUrl);
  if (body.organizerName !== undefined) patch.organizerName = optStrNullable(body.organizerName);
  if (body.organizerAvatarUrl !== undefined) {
    patch.organizerAvatarUrl = optStrNullable(body.organizerAvatarUrl);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  if (Object.keys(patch).length === 0) {
    return { ok: false, errors: ["No valid fields to update"] };
  }
  return { ok: true, patch };
}

module.exports = {
  validateCreateBody,
  validateRichCreate,
  validatePatchBody,
};
