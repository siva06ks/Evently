-- Run once if you already had the original single-table `events` schema.
-- Requires PostgreSQL 11+ (IF NOT EXISTS on columns).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  total_capacity INTEGER NOT NULL DEFAULT 150,
  early_bird_limit INTEGER NOT NULL DEFAULT 50,
  CONSTRAINT early_le_capacity CHECK (early_bird_limit >= 0 AND early_bird_limit <= total_capacity AND total_capacity >= 1)
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'Social';
ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_label VARCHAR(40) NOT NULL DEFAULT 'Free';
ALTER TABLE events ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS date_detail TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_range TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS about_long TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS map_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_name VARCHAR(120);
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_avatar_url TEXT;

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_code VARCHAR(80) NOT NULL,
  attendee_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS tickets_event_code_uq ON tickets(event_id, ticket_code);

CREATE TABLE IF NOT EXISTS saved_events (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_events(user_id);
