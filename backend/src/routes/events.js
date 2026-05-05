const express = require("express");
const { pool } = require("../db");
const { toEvent } = require("../utils/eventMapper");
const { validateRichCreate, validatePatchBody } = require("../validation/event");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const EVENT_COLUMNS = `
  id, title, organizer_email, event_date, category, location, description, price_label,
  summary, date_detail, time_range, about_long, hero_image_url, map_image_url,
  organizer_name, organizer_avatar_url, created_at
`;

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events ORDER BY id DESC`
    );
    res.json(result.rows.map(toEvent));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const result = await pool.query(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = $1`, [id]);
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json(toEvent(row));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = validateRichCreate(req.body, req.identifier);
  if (!parsed.ok) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.errors,
    });
  }

  const p = parsed.payload;

  try {
    const result = await pool.query(
      `INSERT INTO events (
        title, organizer_email, event_date, category, location, description, price_label,
        summary, date_detail, time_range, about_long, hero_image_url, map_image_url,
        organizer_name, organizer_avatar_url
      ) VALUES (
        $1, $2, $3::date, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15
      )
      RETURNING ${EVENT_COLUMNS}`,
      [
        p.title,
        p.organizerEmail,
        p.date,
        p.category,
        p.location,
        p.description,
        p.priceLabel,
        p.summary,
        p.dateDetail,
        p.timeRange,
        p.aboutLong,
        p.heroImageUrl,
        p.mapImageUrl,
        p.organizerName,
        p.organizerAvatarUrl,
      ]
    );

    return res.status(201).json(toEvent(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create event", error: error.message });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const parsed = validatePatchBody(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.errors });
  }

  const { patch } = parsed;

  const fields = [];
  const values = [];
  let i = 1;

  const map = {
    title: "title",
    organizerEmail: "organizer_email",
    date: "event_date",
    category: "category",
    location: "location",
    description: "description",
    priceLabel: "price_label",
    summary: "summary",
    dateDetail: "date_detail",
    timeRange: "time_range",
    aboutLong: "about_long",
    heroImageUrl: "hero_image_url",
    mapImageUrl: "map_image_url",
    organizerName: "organizer_name",
    organizerAvatarUrl: "organizer_avatar_url",
  };

  for (const [key, col] of Object.entries(map)) {
    if (patch[key] === undefined) continue;
    let v = patch[key];
    if (key === "date") {
      fields.push(`${col} = $${i}::date`);
    } else {
      fields.push(`${col} = $${i}`);
    }
    values.push(v);
    i += 1;
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE events SET ${fields.join(", ")}
       WHERE id = $${i}
       RETURNING ${EVENT_COLUMNS}`,
      values
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json(toEvent(row));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update event", error: error.message });
  }
});

module.exports = router;
