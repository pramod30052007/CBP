const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { booking_id, rating, comments } = req.body;
    const [bRows] = await db.execute('SELECT * FROM bookings WHERE booking_id=?', [booking_id]);
    if (!bRows.length) return res.status(404).json({ success:false, message:'Booking not found.' });
    const bk = bRows[0];
    const [r] = await db.execute('INSERT INTO reviews(booking_id,worker_id,hotel_id,rating,comments) VALUES(?,?,?,?,?)',
      [booking_id, bk.worker_id, bk.hotel_id, rating, comments||'']);
    res.status(201).json({ success:true, message:'Review submitted!', review_id:r.insertId });
  } catch(e) { next(e); }
});

router.get('/worker/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT rv.*,h.hotel_name FROM reviews rv JOIN hotels h ON rv.hotel_id=h.hotel_id WHERE rv.worker_id=? ORDER BY rv.created_at DESC', [req.params.id]);
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

module.exports = router;
