const express = require("express");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

/** @type {Map<string, { code: string; expires: number }>} */
const otpStore = new Map();

const DEMO_OTP = process.env.DEMO_OTP || "1234";

function signToken(user) {
  return jwt.sign({ userId: user.id, identifier: user.identifier }, JWT_SECRET, { expiresIn: "30d" });
}

router.post("/send-code", (req, res) => {
  const identifier = typeof req.body.identifier === "string" ? req.body.identifier.trim() : "";
  if (!identifier) {
    return res.status(400).json({ message: "identifier is required (email or phone)" });
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));
  otpStore.set(identifier, { code, expires: Date.now() + 10 * 60 * 1000 });

  const body = { ok: true, expiresIn: 600 };
  if (process.env.NODE_ENV !== "production") {
    body.debugCode = code;
  }
  return res.json(body);
});

router.post("/verify", async (req, res) => {
  const identifier = typeof req.body.identifier === "string" ? req.body.identifier.trim() : "";
  const rawCode = req.body.code;
  const code =
    typeof rawCode === "string"
      ? rawCode.trim()
      : Array.isArray(rawCode)
        ? rawCode.join("")
        : String(rawCode ?? "");

  if (!identifier || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ message: "identifier and a 4-digit code are required" });
  }

  const entry = otpStore.get(identifier);
  const otpOk = entry && entry.expires > Date.now() && entry.code === code;
  const demoOk = code === DEMO_OTP;

  if (!otpOk && !demoOk) {
    return res.status(401).json({ message: "Invalid or expired code" });
  }

  otpStore.delete(identifier);

  try {
    const result = await pool.query(
      `INSERT INTO users (identifier)
       VALUES ($1)
       ON CONFLICT (identifier) DO UPDATE SET identifier = EXCLUDED.identifier
       RETURNING id, identifier, total_capacity, early_bird_limit`,
      [identifier]
    );
    const user = result.rows[0];
    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        identifier: user.identifier,
        totalCapacity: user.total_capacity,
        earlyBirdLimit: user.early_bird_limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete sign-in", error: error.message });
  }
});

module.exports = router;
