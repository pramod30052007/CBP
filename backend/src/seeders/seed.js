/**
 * Database Seeder - Creates real bcrypt hashed accounts for demo/testing
 * Run: node src/seeders/seed.js
 * 
 * Demo Accounts After Seeding:
 * Admin:        admin@workerbook.com   / Admin@123
 * Hotel Owner:  owner@grandhotel.com   / Owner@123
 * Worker:       raj@worker.com         / Worker@123
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_booking_platform',
  multipleStatements: true,
};

async function seed() {
  let connection;
  try {
    console.log('🔗 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    const SALT_ROUNDS = 10;

    // Generate real bcrypt hashes
    console.log('🔑 Generating bcrypt hashes...');
    const adminHash   = await bcrypt.hash('Admin@123',  SALT_ROUNDS);
    const ownerHash   = await bcrypt.hash('Owner@123',  SALT_ROUNDS);
    const workerHash  = await bcrypt.hash('Worker@123', SALT_ROUNDS);
    console.log('✅ Hashes ready\n');

    // Clear existing seed users to avoid duplicates
    await connection.execute(`DELETE FROM notifications WHERE user_id IN (SELECT user_id FROM users WHERE email IN ('admin@workerbook.com','owner@grandhotel.com','owner2@bluestar.com','raj@worker.com','priya@worker.com','kumar@worker.com'))`);
    await connection.execute(`DELETE FROM reviews WHERE 1=1`);
    await connection.execute(`DELETE FROM payments WHERE 1=1`);
    await connection.execute(`DELETE FROM bookings WHERE 1=1`);
    await connection.execute(`DELETE FROM workers WHERE user_id IN (SELECT user_id FROM users WHERE email IN ('raj@worker.com','priya@worker.com','kumar@worker.com'))`);
    await connection.execute(`DELETE FROM hotels WHERE owner_id IN (SELECT user_id FROM users WHERE email IN ('owner@grandhotel.com','owner2@bluestar.com'))`);
    await connection.execute(`DELETE FROM users WHERE email IN ('admin@workerbook.com','owner@grandhotel.com','owner2@bluestar.com','raj@worker.com','priya@worker.com','kumar@worker.com')`);

    console.log('🗑️  Cleared old seed data\n');

    // Insert seed users with real hashes
    const [adminResult] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Admin User', 'admin@workerbook.com', '9000000001', adminHash, 'admin']
    );

    const [owner1Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Amit Sharma', 'owner@grandhotel.com', '9000000002', ownerHash, 'hotel_owner']
    );

    const [owner2Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Sunita Patel', 'owner2@bluestar.com', '9000000003', ownerHash, 'hotel_owner']
    );

    const [worker1Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Raj Kumar', 'raj@worker.com', '9000000004', workerHash, 'worker']
    );

    const [worker2Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Priya Singh', 'priya@worker.com', '9000000005', workerHash, 'worker']
    );

    const [worker3Result] = await connection.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Kumar Ravi', 'kumar@worker.com', '9000000006', workerHash, 'worker']
    );

    console.log('👥 Users created');

    // Insert hotels
    const [hotel1] = await connection.execute(
      `INSERT INTO hotels (owner_id, hotel_name, address, city, contact_number) VALUES (?, ?, ?, ?, ?)`,
      [owner1Result.insertId, 'Grand Palace Hotel', '12 MG Road, Bangalore', 'Bangalore', '0806000001']
    );

    const [hotel2] = await connection.execute(
      `INSERT INTO hotels (owner_id, hotel_name, address, city, contact_number) VALUES (?, ?, ?, ?, ?)`,
      [owner2Result.insertId, 'Blue Star Resort', '45 Beach Road, Goa', 'Goa', '08326000002']
    );

    console.log('🏨 Hotels created');

    // Insert workers
    await connection.execute(
      `INSERT INTO workers (user_id, skills, experience, hourly_rate, availability, location, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [worker1Result.insertId, 'Waiter, Bartender, Event Staff', 3, 150.00, 'available', 'Bangalore', 'verified']
    );

    await connection.execute(
      `INSERT INTO workers (user_id, skills, experience, hourly_rate, availability, location, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [worker2Result.insertId, 'Chef, Kitchen Helper, Food Prep', 5, 200.00, 'available', 'Bangalore', 'verified']
    );

    await connection.execute(
      `INSERT INTO workers (user_id, skills, experience, hourly_rate, availability, location, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [worker3Result.insertId, 'Housekeeping, Room Cleaning, Receptionist', 2, 120.00, 'available', 'Goa', 'pending']
    );

    console.log('👷 Workers created');

    // Insert sample bookings (need category_id from job_categories)
    const [catRows] = await connection.execute(`SELECT category_id FROM job_categories LIMIT 3`);
    if (catRows.length >= 1) {
      await connection.execute(
        `INSERT INTO bookings (hotel_id, worker_id, category_id, booking_date, start_time, end_time, total_hours, hourly_rate, total_amount, booking_status) 
         VALUES (?, (SELECT worker_id FROM workers WHERE user_id = ?), ?, CURDATE(), '09:00:00', '13:00:00', 4, 150.00, 600.00, 'pending')`,
        [hotel1.insertId, worker1Result.insertId, catRows[0].category_id]
      );
    }

    console.log('📋 Sample booking created\n');

    console.log('='.repeat(50));
    console.log('✅  SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n🔐 Demo Login Credentials:');
    console.log('─'.repeat(40));
    console.log('  ADMIN');
    console.log('  Email:    admin@workerbook.com');
    console.log('  Password: Admin@123');
    console.log('');
    console.log('  HOTEL OWNER');
    console.log('  Email:    owner@grandhotel.com');
    console.log('  Password: Owner@123');
    console.log('');
    console.log('  WORKER');
    console.log('  Email:    raj@worker.com');
    console.log('  Password: Worker@123');
    console.log('─'.repeat(40));
    console.log('\n🚀 You can now start the backend: npm run dev\n');

  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Fix: Update DB_PASSWORD in backend/.env with your MySQL root password');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Fix: Import the database schema first:');
      console.error('   mysql -u root -p < database/schema.sql');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
