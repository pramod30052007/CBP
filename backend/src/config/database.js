/**
 * SQLite Database - Zero config, no password needed.
 * Schema + seed data auto-created on first run.
 */
const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const DB_PATH = path.join(__dirname, '../../workerbook.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name  TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    phone      TEXT,
    password_hash TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'worker',
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS job_categories (
    category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL,
    description   TEXT,
    icon          TEXT DEFAULT '👷'
  );

  CREATE TABLE IF NOT EXISTS hotels (
    hotel_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id       INTEGER NOT NULL REFERENCES users(user_id),
    hotel_name     TEXT NOT NULL,
    address        TEXT,
    city           TEXT,
    contact_number TEXT,
    description    TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workers (
    worker_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(user_id),
    skills              TEXT DEFAULT '',
    experience          INTEGER DEFAULT 0,
    hourly_rate         REAL DEFAULT 0,
    availability        TEXT DEFAULT 'available',
    location            TEXT DEFAULT '',
    verification_status TEXT DEFAULT 'pending',
    profile_image       TEXT DEFAULT '',
    bio                 TEXT DEFAULT '',
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    booking_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id       INTEGER NOT NULL REFERENCES hotels(hotel_id),
    worker_id      INTEGER NOT NULL REFERENCES workers(worker_id),
    category_id    INTEGER REFERENCES job_categories(category_id),
    booking_date   TEXT NOT NULL,
    start_time     TEXT NOT NULL,
    end_time       TEXT NOT NULL,
    total_hours    REAL DEFAULT 0,
    hourly_rate    REAL DEFAULT 0,
    total_amount   REAL DEFAULT 0,
    num_workers    INTEGER DEFAULT 1,
    notes          TEXT DEFAULT '',
    booking_status TEXT NOT NULL DEFAULT 'pending',
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    payment_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id       INTEGER NOT NULL REFERENCES bookings(booking_id),
    amount           REAL NOT NULL DEFAULT 0,
    payment_method   TEXT DEFAULT 'cash',
    payment_status   TEXT DEFAULT 'pending',
    transaction_date TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    review_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    worker_id  INTEGER NOT NULL REFERENCES workers(worker_id),
    hotel_id   INTEGER NOT NULL REFERENCES hotels(hotel_id),
    rating     INTEGER NOT NULL DEFAULT 5,
    comments   TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(user_id),
    message         TEXT NOT NULL,
    is_read         INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── Seed (only if empty) ──────────────────────────────────────────────────────
const isEmpty = db.prepare('SELECT COUNT(*) AS c FROM users').get().c === 0;
if (isEmpty) {
  console.log('🌱 Seeding database with demo data...');
  const ins = (sql, vals) => db.prepare(sql).run(...vals).lastInsertRowid;

  const aH = bcrypt.hashSync('Admin@123',  10);
  const oH = bcrypt.hashSync('Owner@123',  10);
  const wH = bcrypt.hashSync('Worker@123', 10);

  const adminId  = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Admin User','admin@workerbook.com','9000000001',aH,'admin']);
  const owner1Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Amit Sharma','owner@grandhotel.com','9000000002',oH,'hotel_owner']);
  const owner2Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Sunita Patel','owner2@bluestar.com','9000000003',oH,'hotel_owner']);
  const w1Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Raj Kumar','raj@worker.com','9000000004',wH,'worker']);
  const w2Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Priya Singh','priya@worker.com','9000000005',wH,'worker']);
  const w3Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Kumar Ravi','kumar@worker.com','9000000006',wH,'worker']);
  const w4Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Meena Das','meena@worker.com','9000000007',wH,'worker']);
  const w5Id = ins(`INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)`,['Suresh Nair','suresh@worker.com','9000000008',wH,'worker']);

  // Categories
  const c1  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Waiter / Waitress','Serve food and beverages','🍽️']);
  const c2  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Chef / Assistant Chef','Prepare and cook meals','👨‍🍳']);
  const c3  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Kitchen Helper','Assist kitchen operations','🥘']);
  const c4  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Room Cleaning Staff','Clean and maintain rooms','🛏️']);
  const c5  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Housekeeping Staff','General housekeeping','🧹']);
  const c6  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Receptionist','Front desk and check-ins','💼']);
  const c7  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Dishwasher','Clean dishes and utensils','🫧']);
  const c8  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Security Guard','Premises security','🔒']);
  const c9  = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Delivery Staff','Deliveries and logistics','🛵']);
  const c10 = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Event / Catering Staff','Events and catering','🎉']);
  const c11 = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Bartender','Prepare and serve drinks','🍹']);
  const c12 = ins(`INSERT INTO job_categories(category_name,description,icon) VALUES(?,?,?)`,['Hotel Maintenance','Repair and maintain facilities','🔧']);

  // Hotels
  const h1 = ins(`INSERT INTO hotels(owner_id,hotel_name,address,city,contact_number,description) VALUES(?,?,?,?,?,?)`, [owner1Id,'Grand Palace Hotel','12 MG Road','Bangalore','0806000001','5-star luxury hotel']);
  const h2 = ins(`INSERT INTO hotels(owner_id,hotel_name,address,city,contact_number,description) VALUES(?,?,?,?,?,?)`, [owner2Id,'Blue Star Resort','45 Beach Road','Goa','08326000002','Premium beach resort']);

  // Workers
  const wr1 = ins(`INSERT INTO workers(user_id,skills,experience,hourly_rate,availability,location,verification_status,bio) VALUES(?,?,?,?,?,?,?,?)`, [w1Id,'Waiter, Bartender, Event Staff',3,150,'available','Bangalore','verified','Experienced waiter with 3 years in 5-star hotels']);
  const wr2 = ins(`INSERT INTO workers(user_id,skills,experience,hourly_rate,availability,location,verification_status,bio) VALUES(?,?,?,?,?,?,?,?)`, [w2Id,'Chef, Kitchen Helper, Food Preparation',5,200,'available','Bangalore','verified','Professional chef trained in continental and Indian cuisine']);
  const wr3 = ins(`INSERT INTO workers(user_id,skills,experience,hourly_rate,availability,location,verification_status,bio) VALUES(?,?,?,?,?,?,?,?)`, [w3Id,'Housekeeping, Room Cleaning, Receptionist',2,120,'available','Goa','pending','Detail-oriented housekeeping professional']);
  const wr4 = ins(`INSERT INTO workers(user_id,skills,experience,hourly_rate,availability,location,verification_status,bio) VALUES(?,?,?,?,?,?,?,?)`, [w4Id,'Receptionist, Event Staff, Customer Service',4,160,'available','Bangalore','verified','Friendly receptionist with excellent communication']);
  const wr5 = ins(`INSERT INTO workers(user_id,skills,experience,hourly_rate,availability,location,verification_status,bio) VALUES(?,?,?,?,?,?,?,?)`, [w5Id,'Security Guard, Hotel Maintenance',6,130,'available','Bangalore','verified','Experienced security professional']);

  // Bookings
  const b1 = ins(`INSERT INTO bookings(hotel_id,worker_id,category_id,booking_date,start_time,end_time,total_hours,hourly_rate,total_amount,booking_status) VALUES(?,?,?,date('now'),?,?,?,?,?,?)`, [h1,wr1,c1,'09:00','13:00',4,150,600,'pending']);
  const b2 = ins(`INSERT INTO bookings(hotel_id,worker_id,category_id,booking_date,start_time,end_time,total_hours,hourly_rate,total_amount,booking_status) VALUES(?,?,?,date('now'),?,?,?,?,?,?)`, [h1,wr2,c2,'08:00','16:00',8,200,1600,'accepted']);
  const b3 = ins(`INSERT INTO bookings(hotel_id,worker_id,category_id,booking_date,start_time,end_time,total_hours,hourly_rate,total_amount,booking_status) VALUES(?,?,?,date('now','-1 day'),?,?,?,?,?,?)`, [h2,wr3,c4,'10:00','14:00',4,120,480,'completed']);
  const b4 = ins(`INSERT INTO bookings(hotel_id,worker_id,category_id,booking_date,start_time,end_time,total_hours,hourly_rate,total_amount,booking_status) VALUES(?,?,?,date('now'),?,?,?,?,?,?)`, [h2,wr4,c6,'06:00','14:00',8,160,1280,'confirmed']);

  // Payments
  ins(`INSERT INTO payments(booking_id,amount,payment_method,payment_status) VALUES(?,?,?,?)`, [b3,480,'cash','completed']);
  ins(`INSERT INTO payments(booking_id,amount,payment_method,payment_status) VALUES(?,?,?,?)`, [b1,600,'cash','pending']);

  // Reviews
  ins(`INSERT INTO reviews(booking_id,worker_id,hotel_id,rating,comments) VALUES(?,?,?,?,?)`, [b3,wr3,h2,4,'Very professional and thorough. Would book again!']);

  // Notifications
  ins(`INSERT INTO notifications(user_id,message) VALUES(?,?)`, [w1Id,'📋 New booking request from Grand Palace Hotel']);
  ins(`INSERT INTO notifications(user_id,message) VALUES(?,?)`, [w2Id,'✅ Your booking has been confirmed']);
  ins(`INSERT INTO notifications(user_id,message) VALUES(?,?)`, [owner1Id,'👷 Raj Kumar accepted your booking']);

  console.log('✅ Database seeded!\n');
  console.log('  Admin:       admin@workerbook.com / Admin@123');
  console.log('  Hotel Owner: owner@grandhotel.com / Owner@123');
  console.log('  Worker:      raj@worker.com       / Worker@123\n');
}

// ── mysql2-compatible API wrapper ─────────────────────────────────────────────
function convertSQL(sql) {
  return sql
    .replace(/`([^`]+)`/g, '"$1"')
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)/gi, 'LIMIT $2 OFFSET $1');
}

const pool = {
  async execute(sql, params = []) {
    const s = convertSQL(sql.trim());
    const up = s.toUpperCase().replace(/\s+/g, ' ');
    const p = (params || []).map(v => v === undefined ? null : v);
    if (up.startsWith('SELECT') || up.startsWith('WITH')) {
      return [db.prepare(s).all(...p)];
    }
    if (up.startsWith('INSERT')) {
      const r = db.prepare(s).run(...p);
      return [{ insertId: r.lastInsertRowid, affectedRows: r.changes }];
    }
    const r = db.prepare(s).run(...p);
    return [{ affectedRows: r.changes }];
  },
  async query(sql, params) { return this.execute(sql, params); },
  async getConnection() {
    return { execute: this.execute.bind(this), query: this.query.bind(this), release() {} };
  }
};

console.log('✅ Database ready (SQLite)');
module.exports = pool;
