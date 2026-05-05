const express = require("express");
const crypto = require("crypto");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, event_id, ticket_code, attendee_name, created_at
       FROM tickets WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(
      result.rows.map((row) => ({
        id: row.id,
        eventId: String(row.event_id),
        ticketId: row.ticket_code,
        attendeeName: row.attendee_name,
        createdAt: row.created_at instanceof Date ? row.created_at.getTime() : Date.parse(row.created_at),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to load tickets", error: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const eventId = Number(req.body.eventId);
  const attendeeName =
    typeof req.body.attendeeName === "string" ? req.body.attendeeName.trim() : "";

  if (!Number.isInteger(eventId) || eventId < 1 || !attendeeName) {
    return res.status(400).json({ message: "eventId and attendeeName are required" });
  }

  try {
    const ev = await pool.query(`SELECT id FROM events WHERE id = $1`, [eventId]);
    if (ev.rowCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ticketCode = `TKT-${eventId}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO tickets (event_id, user_id, ticket_code, attendee_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, event_id, ticket_code, attendee_name, created_at`,
      [eventId, req.userId, ticketCode, attendeeName]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      eventId: String(row.event_id),
      ticketId: row.ticket_code,
      attendeeName: row.attendee_name,
      createdAt: row.created_at instanceof Date ? row.created_at.getTime() : Date.parse(row.created_at),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create ticket", error: error.message });
  }
});

router.post("/verify", requireAuth, async (req, res) => {
  const ticketId = typeof req.body.ticketId === "string" ? req.body.ticketId.trim() : "";
  if (!ticketId) {
    return res.status(400).json({ message: "ticketId is required" });
  }

  try {
    const result = await pool.query(
      `SELECT
         t.id,
         t.event_id,
         t.ticket_code,
         t.attendee_name,
         t.created_at,
         e.title AS event_title,
         e.location AS event_location,
         e.event_date
       FROM tickets t
       INNER JOIN events e ON e.id = t.event_id
       WHERE t.ticket_code = $1
       LIMIT 1`,
      [ticketId]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.json({
      valid: true,
      ticket: {
        id: row.id,
        eventId: String(row.event_id),
        ticketId: row.ticket_code,
        attendeeName: row.attendee_name,
        createdAt:
          row.created_at instanceof Date ? row.created_at.getTime() : Date.parse(row.created_at),
      },
      event: {
        id: String(row.event_id),
        title: row.event_title,
        location: row.event_location,
        date:
          row.event_date instanceof Date
            ? row.event_date.toISOString().slice(0, 10)
            : String(row.event_date).slice(0, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify ticket", error: error.message });
  }
});

module.exports = router;
