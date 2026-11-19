/**
 * Database Migration - Add missing columns for SQLite compatibility
 * Run: node src/migrations/migrate.js
 */
const path = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, '../../workerbook.db'));

const addCol = (table, col, def) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    console.log(`  ✅ Added: ${table}.${col}`);
  } catch(e) {
    if (e.message.includes('duplicate') || e.message.includes('already exists')) {
      console.log(`  ⏭  Exists: ${table}.${col}`);
    } else {
      console.log(`  ⚠  Skip ${col}: ${e.message}`);
    }
  }
};

console.log('\n🔧 Running database migrations...\n');

// users table
addCol('users', 'is_active', 'INTEGER NOT NULL DEFAULT 1');

// workers table
addCol('workers', 'city',             'TEXT');
addCol('workers', 'rating',           'REAL DEFAULT 0');
addCol('workers', 'total_reviews',    'INTEGER DEFAULT 0');
addCol('workers', 'total_earnings',   'REAL DEFAULT 0');
addCol('workers', 'experience_years', 'INTEGER DEFAULT 0');
addCol('workers', 'id_document',      'TEXT');

// bookings table
addCol('bookings', 'num_workers',    'INTEGER DEFAULT 1');
addCol('bookings', 'hourly_rate',    'REAL DEFAULT 0');
addCol('bookings', 'notes',          'TEXT');
addCol('bookings', 'work_location',  'TEXT');

// Set all existing users as active
db.exec('UPDATE users SET is_active = 1');
console.log('\n  ✅ All users set to active');

db.close();
console.log('\n✅ Migration complete!\n');
