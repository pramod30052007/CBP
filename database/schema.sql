-- =============================================================
-- LOCAL WORKER BOOKING PLATFORM - Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS hotel_booking_platform;
USE hotel_booking_platform;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','hotel_owner','worker') NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. JOB CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS job_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'bi-briefcase',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. HOTELS TABLE
CREATE TABLE IF NOT EXISTS hotels (
  hotel_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  hotel_name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  pincode VARCHAR(10),
  contact_number VARCHAR(20),
  email VARCHAR(100),
  description TEXT,
  website VARCHAR(200),
  logo_image VARCHAR(255),
  is_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. WORKERS TABLE
CREATE TABLE IF NOT EXISTS workers (
  worker_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skills TEXT,
  experience_years INT DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0.00,
  availability ENUM('available','busy','offline') DEFAULT 'available',
  location VARCHAR(200),
  city VARCHAR(100),
  bio TEXT,
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  profile_image VARCHAR(255),
  id_document VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  worker_id INT NOT NULL,
  category_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours DECIMAL(5,2) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  workers_required INT DEFAULT 1,
  work_location TEXT,
  special_instructions TEXT,
  booking_status ENUM('pending','accepted','rejected','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES job_categories(category_id)
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash','online','card','upi') DEFAULT 'cash',
  payment_status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  worker_id INT NOT NULL,
  hotel_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  related_id INT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- SEED DATA
-- =============================================================

-- Admin user (password: Admin@123)
INSERT INTO users (full_name, email, phone, password_hash, role) VALUES
('Platform Admin', 'admin@hotelplatform.com', '9999999999', '$2b$10$YourHashHere.AdminPassword123', 'admin'),
('Raj Sharma', 'owner1@example.com', '9876543210', '$2b$10$YourHashHere.OwnerPassword123', 'hotel_owner'),
('Priya Patel', 'owner2@example.com', '9876543211', '$2b$10$YourHashHere.OwnerPassword123', 'hotel_owner'),
('Amit Kumar', 'worker1@example.com', '9876543212', '$2b$10$YourHashHere.WorkerPassword123', 'worker'),
('Sunita Devi', 'worker2@example.com', '9876543213', '$2b$10$YourHashHere.WorkerPassword123', 'worker'),
('Ravi Verma', 'worker3@example.com', '9876543214', '$2b$10$YourHashHere.WorkerPassword123', 'worker');

-- Job Categories
INSERT INTO job_categories (category_name, description, icon) VALUES
('Waiter / Waitress', 'Serve food and beverages to guests in restaurants and banquet halls', 'bi-cup-straw'),
('Chef / Assistant Chef', 'Prepare and cook meals in hotel and restaurant kitchens', 'bi-fire'),
('Kitchen Helper', 'Assist chef and kitchen staff with food preparation tasks', 'bi-scissors'),
('Room Cleaning Staff', 'Clean and maintain guest rooms and hotel premises', 'bi-stars'),
('Housekeeping Staff', 'Maintain cleanliness and order throughout the hotel', 'bi-house-heart'),
('Receptionist', 'Welcome guests, handle check-ins/check-outs and reservations', 'bi-telephone'),
('Dishwasher', 'Wash and sanitize dishes, utensils and kitchen equipment', 'bi-droplet'),
('Security Guard', 'Ensure safety and security of hotel premises and guests', 'bi-shield-check'),
('Delivery Staff', 'Deliver food, supplies and items within or outside the hotel', 'bi-truck'),
('Event / Catering Staff', 'Assist with events, banquets and catering operations', 'bi-balloon'),
('Bartender', 'Prepare and serve drinks at the hotel bar', 'bi-cup'),
('Hotel Maintenance Worker', 'Perform repairs and maintenance of hotel facilities', 'bi-tools');

-- Hotels
INSERT INTO hotels (owner_id, hotel_name, address, city, state, pincode, contact_number, email, description) VALUES
(2, 'Grand Palace Hotel', '123 MG Road, Sector 5', 'Bangalore', 'Karnataka', '560001', '080-12345678', 'info@grandpalace.com', 'A luxury 5-star hotel in the heart of Bangalore'),
(3, 'Sunrise Residency', '45 Park Street, Bandra West', 'Mumbai', 'Maharashtra', '400050', '022-98765432', 'info@sunriseresidency.com', 'Premium business hotel with excellent amenities');

-- Workers
INSERT INTO workers (user_id, skills, experience_years, hourly_rate, availability, location, city, bio, verification_status, rating) VALUES
(4, 'Waiter, Food Service, Customer Relations, Banquet Service', 3, 150.00, 'available', 'Koramangala, Bangalore', 'Bangalore', 'Experienced waiter with 3 years in 5-star hotels. Polite and professional.', 'verified', 4.50),
(5, 'Housekeeping, Room Cleaning, Laundry, Deep Cleaning', 5, 120.00, 'available', 'Andheri, Mumbai', 'Mumbai', 'Dedicated housekeeping professional with attention to detail.', 'verified', 4.80),
(6, 'Kitchen Helper, Food Prep, Dish Washing, Inventory Management', 2, 100.00, 'available', 'Indiranagar, Bangalore', 'Bangalore', 'Hardworking kitchen helper ready to assist in any hotel kitchen.', 'pending', 4.20);

-- Sample Bookings
INSERT INTO bookings (hotel_id, worker_id, category_id, booking_date, start_time, end_time, total_hours, hourly_rate, total_amount, booking_status, work_location) VALUES
(1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '13:00:00', 4.00, 150.00, 600.00, 'confirmed', 'Grand Palace Hotel, Bangalore'),
(1, 2, 5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '16:00:00', 8.00, 120.00, 960.00, 'pending', 'Grand Palace Hotel, Bangalore'),
(2, 3, 3, CURDATE(), '10:00:00', '14:00:00', 4.00, 100.00, 400.00, 'completed', 'Sunrise Residency, Mumbai');

-- Sample Payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES
(1, 600.00, 'online', 'completed'),
(3, 400.00, 'cash', 'completed');

-- Sample Notifications  
INSERT INTO notifications (user_id, message, type, related_id) VALUES
(4, 'You have a new booking request from Grand Palace Hotel for Waiter position on tomorrow.', 'booking', 1),
(5, 'New booking request received from Grand Palace Hotel for Housekeeping.', 'booking', 2),
(2, 'Your booking for Amit Kumar (Waiter) has been confirmed.', 'booking', 1);
