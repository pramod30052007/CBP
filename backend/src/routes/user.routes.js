const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id=?', [req.user.user_id]);
    res.json({ success: true, data: users[0] });
  } catch (error) { next(error); }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    await db.execute('UPDATE users SET full_name=?, phone=? WHERE user_id=?', [full_name, phone, req.user.user_id]);
    res.json({ success: true, message: 'Profile updated!' });
  } catch (error) { next(error); }
});

// POST /api/users/change-password
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const [users] = await db.execute('SELECT password_hash FROM users WHERE user_id=?', [req.user.user_id]);
    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    const hash = await bcrypt.hash(new_password, 10);
    await db.execute('UPDATE users SET password_hash=? WHERE user_id=?', [hash, req.user.user_id]);
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) { next(error); }
});

module.exports = router;
