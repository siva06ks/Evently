const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const eventsRouter = require("./routes/events");
const authRouter = require("./routes/auth");
const meRouter = require("./routes/me");
const ticketsRouter = require("./routes/tickets");
const savedRouter = require("./routes/saved");

const app = express();
const PORT = Number(process.env.PORT || 5050);

/** Expo Web runs on another origin (e.g. http://localhost:8081) — browsers require CORS + OPTIONS preflight. */
const corsOptions = {
  origin: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "evently-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/saved-events", savedRouter);
app.use("/api/events", eventsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Evently API running on http://${HOST}:${PORT}`);
});
