-- Full schema for Evently (replace DB or run on fresh Postgres)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  total_capacity INTEGER NOT NULL DEFAULT 150,
  early_bird_limit INTEGER NOT NULL DEFAULT 50,
  CONSTRAINT early_le_capacity CHECK (early_bird_limit >= 0 AND early_bird_limit <= total_capacity AND total_capacity >= 1)
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  organizer_email VARCHAR(120) NOT NULL,
  event_date DATE NOT NULL,
  category VARCHAR(40) NOT NULL DEFAULT 'Social',
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_label VARCHAR(40) NOT NULL DEFAULT 'Free',
  summary TEXT,
  date_detail TEXT,
  time_range TEXT,
  about_long TEXT,
  hero_image_url TEXT,
  map_image_url TEXT,
  organizer_name VARCHAR(120),
  organizer_avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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

-- Sample events (only when table is empty)
INSERT INTO events (
  title, organizer_email, event_date, category, location, description, price_label,
  summary, date_detail, time_range, about_long,
  hero_image_url, map_image_url, organizer_name, organizer_avatar_url
)
SELECT title, organizer_email, event_date, category, location, description, price_label,
  summary, date_detail, time_range, about_long,
  hero_image_url, map_image_url, organizer_name, organizer_avatar_url
FROM (
  VALUES
    (
      'Watercolor Basics Workshop',
      'studio@evently.local',
      '2024-10-14'::date,
      'Arts',
      'Community Center',
      'Learn watercolor painting in a supportive setting.',
      '$15',
      'A hands-on intro to color washing and simple landscapes in a small group.',
      'Saturday, Oct 14, 2024',
      '10:00 AM - 1:00 PM PDT',
      'Bring your curiosity—supplies are included.',
      'https://images.unsplash.com/photo-1520423465872-5e0b6f05e29d?auto=format&w=1200&q=80',
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80',
      'Creative Neighbors Co-op',
      'https://i.pravatar.cc/200?u=org-watercolor'
    ),
    (
      'Gentle Morning Yoga',
      'wellness@evently.local',
      '2024-10-17'::date,
      'Health',
      'Botanical Gardens',
      'A beginner-friendly yoga session for all ages.',
      'Free',
      'Slow flows and deep breathing surrounded by the quiet of the garden paths.',
      'Tuesday, Oct 17, 2024',
      '9:00 AM - 10:00 AM PDT',
      'We''ll move through a gentle flow designed for all bodies.',
      'https://images.unsplash.com/photo-1545205597-3b9a04fbb0d4?auto=format&w=1200&q=80',
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80',
      'Open Air Wellness',
      'https://i.pravatar.cc/200?u=org-yoga'
    ),
    (
      'Neighborhood Supper Club',
      'hall@evently.local',
      '2024-10-20'::date,
      'Social',
      'Main Hall',
      'Meet neighbors and share a cozy evening meal.',
      '$5',
      'A potluck with assigned dishes so the table always feels balanced and warm.',
      'Friday, Oct 20, 2024',
      '6:30 PM - 9:00 PM PDT',
      'We assign categories so the menu stays fun.',
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&w=1200&q=80',
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80',
      'Main Hall Residents',
      'https://i.pravatar.cc/200?u=org-supper'
    ),
    (
      'Future Tech Summit 2024',
      'tech@evently.local',
      '2024-10-24'::date,
      'Technology',
      'Moscone Center',
      'A full-day look at the tools shaping the next generation of design and product teams.',
      '$149',
      'Join industry leaders to explore the future of AI and immersive design.',
      'Saturday, Oct 24, 2024',
      '9:00 AM - 5:00 PM PST',
      'Future Tech Summit brings together product builders and designers.',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&w=1200&q=80',
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80',
      'TechVision Partners',
      'https://i.pravatar.cc/200?u=techvision'
    )
) AS v(
  title, organizer_email, event_date, category, location, description, price_label,
  summary, date_detail, time_range, about_long,
  hero_image_url, map_image_url, organizer_name, organizer_avatar_url
)
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);
