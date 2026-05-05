const { Pool } = require("pg");
const os = require("os");

const defaultDbUser = process.env.USER || os.userInfo().username;
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const useSsl =
  String(process.env.DB_SSL || "").toLowerCase() === "true" || hasDatabaseUrl;

const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || defaultDbUser,
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME || "evently",
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });

module.exports = { pool };
