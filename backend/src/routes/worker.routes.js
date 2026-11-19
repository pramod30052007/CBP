const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');

// GET /api/workers — public, filterable
router.get('/', async (req, res, next) => {
  try {
    const { city, availability, min_rate, max_rate, search } = req.query;
    let sql = `
      SELECT w.worker_id, w.skills, w.experience, w.hourly_rate, w.availability,
             w.location, w.verification_status, w.profile_image, w.bio,
             w.location AS city, w.experience AS experience_years,
             u.full_name, u.email, u.phone,
             COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS avg_rating,
             COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS rating,
             COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS total_reviews,
             COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.worker_id=w.worker_id AND b.booking_status='completed'),0) AS completed_jobs
      FROM workers w JOIN users u ON w.user_id=u.user_id
      WHERE u.is_active=1
    `;
    const p = [];
    if (city)         { sql += ' AND (w.location LIKE ? OR w.location LIKE ?)'; p.push(`%${city}%`, `%${city}%`); }
    if (availability) { sql += ' AND w.availability=?'; p.push(availability); }
    if (min_rate)     { sql += ' AND w.hourly_rate>=?'; p.push(Number(min_rate)); }
    if (max_rate)     { sql += ' AND w.hourly_rate<=?'; p.push(Number(max_rate)); }
    if (search)       { sql += ' AND (u.full_name LIKE ? OR w.skills LIKE ? OR w.bio LIKE ?)'; p.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    sql += ' ORDER BY avg_rating DESC, completed_jobs DESC';
    const [rows] = await db.execute(sql, p);
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

// GET /api/workers/my/profile — own profile (must be before /:id)
router.get('/my/profile', authenticate, authorize('worker'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT w.*, w.location AS city, w.experience AS experience_years,
             u.full_name, u.email, u.phone,
             COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS avg_rating,
             COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS rating,
             COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS total_reviews,
             COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.worker_id=w.worker_id AND b.booking_status='completed'),0) AS completed_jobs,
             COALESCE((SELECT SUM(b.total_amount) FROM bookings b WHERE b.worker_id=w.worker_id AND b.booking_status='completed'),0) AS total_earnings
      FROM workers w JOIN users u ON w.user_id=u.user_id WHERE w.user_id=?`, [req.user.user_id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Worker profile not found.' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { next(e); }
});

// GET /api/workers/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT w.*, w.location AS city, w.experience AS experience_years,
             u.full_name, u.email, u.phone,
             COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS avg_rating,
             COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS rating,
             COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.worker_id=w.worker_id),0) AS total_reviews,
             COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.worker_id=w.worker_id AND b.booking_status='completed'),0) AS completed_jobs
      FROM workers w JOIN users u ON w.user_id=u.user_id WHERE w.worker_id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Worker not found.' });
    const [reviews] = await db.execute(`
      SELECT rv.rating, rv.comments, rv.created_at, h.hotel_name
      FROM reviews rv JOIN hotels h ON rv.hotel_id=h.hotel_id
      WHERE rv.worker_id=? ORDER BY rv.created_at DESC LIMIT 10`, [req.params.id]);
    res.json({ success:true, data:{ ...rows[0], reviews } });
  } catch(e) { next(e); }
});

// PUT /api/workers/profile — update own profile (handles both multipart and json)
router.put('/profile', authenticate, authorize('worker'), (req, res, next) => {
  upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'id_document', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) return res.status(400).json({ success:false, message: err.message });
    try {
      const { skills, experience, experience_years, hourly_rate, availability, location, city, bio } = req.body;
      const exp = experience || experience_years || 0;
      const loc = location || city || '';

      let photoPath = null;
      if (req.files?.profile_image?.[0]) {
        photoPath = `/uploads/profiles/${req.files.profile_image[0].filename}`;
      }

      let sql = 'UPDATE workers SET skills=?, experience=?, hourly_rate=?, availability=?, location=?, bio=?';
      let p = [skills||'', Number(exp)||0, Number(hourly_rate)||0, availability||'available', loc, bio||''];

      if (photoPath) {
        sql += ', profile_image=?';
        p.push(photoPath);
      }
      sql += ' WHERE user_id=?';
      p.push(req.user.user_id);

      await db.execute(sql, p);

      const [rows] = await db.execute('SELECT w.*, w.location AS city, u.full_name, u.email FROM workers w JOIN users u ON w.user_id=u.user_id WHERE w.user_id=?', [req.user.user_id]);
      res.json({ success:true, message:'Profile updated successfully!', data:rows[0] });
    } catch(e) { next(e); }
  });
});

module.exports = router;
