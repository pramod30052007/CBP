const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [[a]] = await db.execute('SELECT COUNT(*) AS n FROM users');
    const [[b]] = await db.execute('SELECT COUNT(*) AS n FROM workers');
    const [[c]] = await db.execute('SELECT COUNT(*) AS n FROM hotels');
    const [[d]] = await db.execute('SELECT COUNT(*) AS n FROM bookings');
    const [[e]] = await db.execute("SELECT COALESCE(SUM(amount),0) AS n FROM payments WHERE payment_status='completed'");
    const [[f]] = await db.execute("SELECT COUNT(*) AS n FROM workers WHERE verification_status='pending'");
    const [byStatus] = await db.execute('SELECT booking_status, COUNT(*) AS count FROM bookings GROUP BY booking_status');
    res.json({ success:true, data:{ total_users:a.n, total_workers:b.n, total_hotels:c.n, total_bookings:d.n, total_revenue:e.n, pending_verifications:f.n, bookingsByStatus:byStatus } });
  } catch(e) { next(e); }
});

router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let sql = 'SELECT user_id,full_name,email,phone,role,is_active,created_at FROM users WHERE 1=1';
    const p = [];
    if (role)   { sql+=' AND role=?'; p.push(role); }
    if (search) { sql+=' AND (full_name LIKE ? OR email LIKE ?)'; p.push(`%${search}%`,`%${search}%`); }
    sql+=' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, p);
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

router.patch('/users/:id/toggle', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT is_active FROM users WHERE user_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'User not found.' });
    const newVal = rows[0].is_active ? 0 : 1;
    await db.execute('UPDATE users SET is_active=? WHERE user_id=?', [newVal, req.params.id]);
    res.json({ success:true, message: newVal ? 'User activated.' : 'User deactivated.' });
  } catch(e) { next(e); }
});

router.get('/workers', async (req, res, next) => {
  try {
    const vs = req.query.verification_status;
    let sql = 'SELECT w.*,u.full_name,u.email,u.phone FROM workers w JOIN users u ON w.user_id=u.user_id WHERE 1=1';
    const p = [];
    if (vs) { sql+=' AND w.verification_status=?'; p.push(vs); }
    sql+=' ORDER BY w.created_at DESC';
    const [rows] = await db.execute(sql, p);
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

router.patch('/workers/:id/verify', async (req, res, next) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE workers SET verification_status=? WHERE worker_id=?', [status, req.params.id]);
    const [w] = await db.execute('SELECT user_id FROM workers WHERE worker_id=?', [req.params.id]);
    if (w.length) await db.execute('INSERT INTO notifications(user_id,message) VALUES(?,?)',
      [w[0].user_id, `✅ Your profile has been ${status} by admin.`]);
    res.json({ success:true, message:`Worker ${status}.` });
  } catch(e) { next(e); }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT b.*, h.hotel_name, u.full_name AS worker_name, jc.category_name, p.payment_status
      FROM bookings b
      JOIN hotels h ON b.hotel_id=h.hotel_id
      JOIN workers w ON b.worker_id=w.worker_id
      JOIN users u ON w.user_id=u.user_id
      LEFT JOIN job_categories jc ON b.category_id=jc.category_id
      LEFT JOIN payments p ON b.booking_id=p.booking_id
      ORDER BY b.created_at DESC`);
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

module.exports = router;
