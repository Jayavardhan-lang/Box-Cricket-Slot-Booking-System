CREATE DATABASE IF NOT EXISTS eagle_box_cricket;
USE eagle_box_cricket;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(100),
  customer_type ENUM('player','team','corporate') DEFAULT 'player',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('available','booked','blocked') DEFAULT 'available',
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  slot_id INT NOT NULL,
  team_name VARCHAR(100),
  num_players INT DEFAULT 1,
  total_amount DECIMAL(10,2),
  payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
  booking_status ENUM('confirmed','cancelled','pending') DEFAULT 'pending',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (slot_id) REFERENCES slots(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','upi','card') DEFAULT 'cash',
  payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE tournaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  max_teams INT DEFAULT 8,
  status ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tournament_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  captain_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  payment_status ENUM('pending','paid') DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  plan_name ENUM('basic','premium','corporate') DEFAULT 'basic',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active','expired') DEFAULT 'active',
  amount_paid DECIMAL(10,2),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  team_name VARCHAR(100),
  membership_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membership_id) REFERENCES memberships(id)
);

CREATE TABLE fixtures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  team1 VARCHAR(100) NOT NULL,
  team2 VARCHAR(100) NOT NULL,
  match_date DATE,
  match_time TIME,
  result VARCHAR(200),
  status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE points_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  lost INT DEFAULT 0,
  points INT DEFAULT 0,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE occupancy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_id INT NOT NULL,
  date DATE NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (slot_id) REFERENCES slots(id)
);

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  booking_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ─── Seed Data ────────────────────────────────────────────────────────────────

INSERT INTO slots (date, start_time, end_time, status, price) VALUES
('2026-06-15', '06:00:00', '07:00:00', 'available', 800),
('2026-06-15', '07:00:00', '08:00:00', 'available', 800),
('2026-06-15', '08:00:00', '09:00:00', 'available', 1000),
('2026-06-15', '09:00:00', '10:00:00', 'available', 1000),
('2026-06-15', '16:00:00', '17:00:00', 'available', 1200),
('2026-06-15', '17:00:00', '18:00:00', 'available', 1200),
('2026-06-15', '18:00:00', '19:00:00', 'available', 1500),
('2026-06-15', '19:00:00', '20:00:00', 'available', 1500),
('2026-06-15', '20:00:00', '21:00:00', 'available', 1500),
('2026-06-16', '06:00:00', '07:00:00', 'available', 800),
('2026-06-16', '08:00:00', '09:00:00', 'available', 1000),
('2026-06-16', '18:00:00', '19:00:00', 'available', 1500),
('2026-06-16', '19:00:00', '20:00:00', 'booked', 1500),
('2026-06-17', '07:00:00', '08:00:00', 'available', 800),
('2026-06-17', '17:00:00', '18:00:00', 'available', 1200);

INSERT INTO tournaments (name, date, entry_fee, max_teams, status) VALUES
('Summer Cup 2026', '2026-06-20', 500, 8, 'upcoming'),
('Corporate Trophy 2026', '2026-06-25', 1000, 16, 'upcoming'),
('Weekend Warriors League', '2026-06-28', 300, 12, 'upcoming');

INSERT INTO customers (name, phone, email, customer_type) VALUES
('Rahul Sharma', '9876543210', 'rahul@email.com', 'player'),
('Team Thunder', '9123456780', 'thunder@email.com', 'team'),
('TCS Cricket Club', '9988776655', 'tcs@email.com', 'corporate');
