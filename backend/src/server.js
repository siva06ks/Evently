const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const eventsRouter = require("./routes/events");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "evently-api" });
});

app.use("/api/events", eventsRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Evently API running on http://localhost:${PORT}`);
});
