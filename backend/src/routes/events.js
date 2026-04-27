const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, organizer_email, event_date FROM events ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { title, organizerEmail, date } = req.body;

  if (!title || !organizerEmail || !date) {
    return res.status(400).json({ message: "title, organizerEmail and date are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (title, organizer_email, event_date)
       VALUES ($1, $2, $3)
       RETURNING id, title, organizer_email, event_date`,
      [title, organizerEmail, date]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create event", error: error.message });
  }
});

module.exports = router;
