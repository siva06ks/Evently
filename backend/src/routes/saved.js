const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT event_id FROM saved_events WHERE user_id = $1 ORDER BY event_id DESC`,
      [req.userId]
    );
    res.json(result.rows.map((r) => r.event_id));
  } catch (error) {
    res.status(500).json({ message: "Failed to load saved events", error: error.message });
  }
});

router.post("/:eventId", requireAuth, async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  try {
    const exists = await pool.query(`SELECT 1 FROM events WHERE id = $1`, [eventId]);
    if (exists.rowCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    await pool.query(
      `INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2)
       ON CONFLICT (user_id, event_id) DO NOTHING`,
      [req.userId, eventId]
    );
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to save event", error: error.message });
  }
});

router.delete("/:eventId", requireAuth, async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  try {
    await pool.query(`DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2`, [
      req.userId,
      eventId,
    ]);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove saved event", error: error.message });
  }
});

module.exports = router;
