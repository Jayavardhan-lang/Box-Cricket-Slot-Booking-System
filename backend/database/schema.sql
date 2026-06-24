-- ============================================================
--  Eagle Box Cricket — PostgreSQL Schema for Supabase
--  Converted from MySQL by Antigravity
-- ============================================================

-- ── 1. ENUM TYPES (create before tables) ────────────────────
CREATE TYPE customer_type_enum      AS ENUM ('player', 'team', 'corporate');
CREATE TYPE slot_status_enum        AS ENUM ('available', 'booked', 'blocked');
CREATE TYPE booking_status_enum     AS ENUM ('confirmed', 'cancelled', 'pending');
CREATE TYPE payment_status_enum     AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE payment_method_enum     AS ENUM ('cash', 'upi', 'card');
CREATE TYPE tournament_status_enum  AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE plan_name_enum          AS ENUM ('basic', 'premium', 'corporate');
CREATE TYPE membership_status_enum  AS ENUM ('active', 'expired');
CREATE TYPE fixture_status_enum     AS ENUM ('scheduled', 'completed', 'cancelled');

-- ── 2. TABLES ───────────────────────────────────────────────

CREATE TABLE customers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(15)  NOT NULL UNIQUE,
  email         VARCHAR(100),
  customer_type customer_type_enum DEFAULT 'player',
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE slots (
  id         SERIAL PRIMARY KEY,
  date       DATE    NOT NULL,
  start_time TIME    NOT NULL,
  end_time   TIME    NOT NULL,
  status     slot_status_enum DEFAULT 'available',
  price      NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL,
  slot_id         INTEGER NOT NULL,
  team_name       VARCHAR(100),
  num_players     INTEGER DEFAULT 1,
  total_amount    NUMERIC(10,2),
  payment_status  payment_status_enum  DEFAULT 'pending',
  booking_status  booking_status_enum  DEFAULT 'pending',
  booked_at       TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,
  CONSTRAINT fk_bookings_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_slot
    FOREIGN KEY (slot_id)     REFERENCES slots(id)     ON DELETE RESTRICT
);

CREATE TABLE payments (
  id             SERIAL PRIMARY KEY,
  booking_id     INTEGER NOT NULL,
  amount         NUMERIC(10,2) NOT NULL,
  payment_method payment_method_enum  DEFAULT 'cash',
  payment_status payment_status_enum  DEFAULT 'pending',
  paid_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE tournaments (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  date       DATE         NOT NULL,
  entry_fee  NUMERIC(10,2) DEFAULT 0,
  max_teams  INTEGER       DEFAULT 8,
  status     tournament_status_enum DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournament_registrations (
  id             SERIAL PRIMARY KEY,
  tournament_id  INTEGER NOT NULL,
  team_name      VARCHAR(100) NOT NULL,
  captain_name   VARCHAR(100) NOT NULL,
  phone          VARCHAR(15)  NOT NULL,
  payment_status payment_status_enum DEFAULT 'pending',
  registered_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_reg_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE TABLE memberships (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  plan_name   plan_name_enum        DEFAULT 'basic',
  start_date  DATE   NOT NULL,
  end_date    DATE   NOT NULL,
  status      membership_status_enum DEFAULT 'active',
  amount_paid NUMERIC(10,2),
  CONSTRAINT fk_memberships_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE players (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(15),
  team_name     VARCHAR(100),
  membership_id INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_players_membership
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE SET NULL
);

CREATE TABLE fixtures (
  id            SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL,
  team1         VARCHAR(100) NOT NULL,
  team2         VARCHAR(100) NOT NULL,
  match_date    DATE,
  match_time    TIME,
  result        VARCHAR(200),
  status        fixture_status_enum DEFAULT 'scheduled',
  CONSTRAINT fk_fixtures_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE TABLE points_table (
  id            SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL,
  team_name     VARCHAR(100) NOT NULL,
  played        INTEGER DEFAULT 0,
  won           INTEGER DEFAULT 0,
  lost          INTEGER DEFAULT 0,
  points        INTEGER DEFAULT 0,
  CONSTRAINT fk_points_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE TABLE occupancy (
  id                SERIAL PRIMARY KEY,
  slot_id           INTEGER NOT NULL,
  date              DATE    NOT NULL,
  is_occupied       BOOLEAN DEFAULT FALSE,
  revenue_generated NUMERIC(10,2) DEFAULT 0,
  CONSTRAINT fk_occupancy_slot
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE
);

CREATE TABLE feedback (
  id           SERIAL PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  booking_id   INTEGER NOT NULL,
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_feedback_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_booking
    FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE CASCADE
);

-- ── 3. INDEXES ──────────────────────────────────────────────
CREATE INDEX idx_slots_date        ON slots(date);
CREATE INDEX idx_slots_status      ON slots(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_slot     ON bookings(slot_id);
CREATE INDEX idx_bookings_status   ON bookings(booking_status);
CREATE INDEX idx_customers_phone   ON customers(phone);
CREATE INDEX idx_bookings_date     ON bookings(booked_at);

-- ── 4. SAMPLE DATA ──────────────────────────────────────────
INSERT INTO slots (date, start_time, end_time, status, price) VALUES
  ('2026-06-25', '06:00', '07:00', 'available', 800),
  ('2026-06-25', '07:00', '08:00', 'available', 800),
  ('2026-06-25', '08:00', '09:00', 'available', 1000),
  ('2026-06-25', '09:00', '10:00', 'available', 1000),
  ('2026-06-25', '16:00', '17:00', 'available', 1200),
  ('2026-06-25', '17:00', '18:00', 'available', 1200),
  ('2026-06-25', '18:00', '19:00', 'available', 1500),
  ('2026-06-25', '19:00', '20:00', 'available', 1500),
  ('2026-06-25', '20:00', '21:00', 'available', 1500);

INSERT INTO tournaments (name, date, entry_fee, max_teams, status) VALUES
  ('Summer Cup 2026',        '2026-06-30', 500,  8,  'upcoming'),
  ('Corporate Trophy 2026',  '2026-07-05', 1000, 16, 'upcoming');

INSERT INTO customers (name, phone, email, customer_type) VALUES
  ('Rahul Sharma',    '9876543210', 'rahul@email.com',   'player'),
  ('Team Thunder',    '9123456780', 'thunder@email.com', 'team'),
  ('TCS Cricket Club','9988776655', 'tcs@email.com',     'corporate');
