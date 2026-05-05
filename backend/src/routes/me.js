const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, identifier, total_capacity, early_bird_limit
       FROM users WHERE id = $1`,
      [req.userId]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: row.id,
      identifier: row.identifier,
      totalCapacity: row.total_capacity,
      earlyBirdLimit: row.early_bird_limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load profile", error: error.message });
  }
});

router.patch("/limits", requireAuth, async (req, res) => {
  const total = Number(req.body.totalCapacity);
  const early = Number(req.body.earlyBirdLimit);

  if (!Number.isFinite(total) || !Number.isFinite(early)) {
    return res.status(400).json({ message: "totalCapacity and earlyBirdLimit must be numbers" });
  }
  if (total < 1 || early < 0 || early > total) {
    return res.status(400).json({ message: "Invalid limits (need total >= 1 and 0 <= early <= total)" });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET total_capacity = $1, early_bird_limit = $2
       WHERE id = $3
       RETURNING id, identifier, total_capacity, early_bird_limit`,
      [Math.floor(total), Math.floor(early), req.userId]
    );
    const row = result.rows[0];
    return res.json({
      id: row.id,
      identifier: row.identifier,
      totalCapacity: row.total_capacity,
      earlyBirdLimit: row.early_bird_limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update limits", error: error.message });
  }
});

module.exports = router;
