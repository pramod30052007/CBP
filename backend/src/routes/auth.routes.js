const express  = require('express');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const router    = express.Router();
const db        = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'WorkerBook_JWT_2024';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ success:false, message:'Name, email and password are required.' });
    const allowed = ['admin','hotel_owner','worker'];
    const userRole = allowed.includes(role) ? role : 'worker';

    const [existing] = await db.execute('SELECT user_id FROM users WHERE email=?', [email]);
    if (existing.length) return res.status(409).json({ success:false, message:'Email already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users(full_name,email,phone,password_hash,role) VALUES(?,?,?,?,?)',
      [full_name, email, phone||'', hash, userRole]
    );
    const userId = result.insertId;

    // Auto-create worker profile
    if (userRole === 'worker') {
      await db.execute('INSERT INTO workers(user_id) VALUES(?)', [userId]);
    }

    const token = jwt.sign({ user_id:userId, role:userRole }, JWT_SECRET, { expiresIn:'7d' });
    const user  = { user_id:userId, full_name, email, role:userRole };
    res.status(201).json({ success:true, message:'Registration successful!', token, user });
  } catch(e) { next(e); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required.' });

    const [users] = await db.execute('SELECT * FROM users WHERE email=?', [email.toLowerCase().trim()]);
    if (!users.length) return res.status(401).json({ success:false, message:'Invalid email or password.' });
    const user = users[0];

    if (!user.is_active) return res.status(403).json({ success:false, message:'Account deactivated. Contact support.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success:false, message:'Invalid email or password.' });

    const token = jwt.sign({ user_id:user.user_id, role:user.role }, JWT_SECRET, { expiresIn:'7d' });
    res.json({ success:true, message:'Login successful!', token, user:{ user_id:user.user_id, full_name:user.full_name, email:user.email, phone:user.phone, role:user.role } });
  } catch(e) { next(e); }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success:false, message:'No token.' });
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const [rows] = await db.execute('SELECT user_id,full_name,email,phone,role FROM users WHERE user_id=?', [payload.user_id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'User not found.' });
    res.json({ success:true, user:rows[0] });
  } catch(e) { next(e); }
});

module.exports = router;
