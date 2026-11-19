const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/payments/my
router.get('/my', authenticate, async (req, res, next) => {
  try {
    let query, params = [];
    if (req.user.role === 'hotel_owner') {
      const [hotels] = await db.execute('SELECT hotel_id FROM hotels WHERE owner_id=?', [req.user.user_id]);
      if (!hotels.length) return res.json({ success: true, data: [] });
      query = 'SELECT p.*, b.booking_date, b.total_hours, h.hotel_name, u.full_name as worker_name FROM payments p JOIN bookings b ON p.booking_id=b.booking_id JOIN hotels h ON b.hotel_id=h.hotel_id JOIN workers w ON b.worker_id=w.worker_id JOIN users u ON w.user_id=u.user_id WHERE b.hotel_id=? ORDER BY p.transaction_date DESC';
      params = [hotels[0].hotel_id];
    } else if (req.user.role === 'worker') {
      const [workers] = await db.execute('SELECT worker_id FROM workers WHERE user_id=?', [req.user.user_id]);
      if (!workers.length) return res.json({ success: true, data: [] });
      query = 'SELECT p.*, b.booking_date, b.total_hours, h.hotel_name FROM payments p JOIN bookings b ON p.booking_id=b.booking_id JOIN hotels h ON b.hotel_id=h.hotel_id WHERE b.worker_id=? ORDER BY p.transaction_date DESC';
      params = [workers[0].worker_id];
    } else {
      query = 'SELECT p.*, b.booking_date, h.hotel_name, u.full_name as worker_name FROM payments p JOIN bookings b ON p.booking_id=b.booking_id JOIN hotels h ON b.hotel_id=h.hotel_id JOIN workers w ON b.worker_id=w.worker_id JOIN users u ON w.user_id=u.user_id ORDER BY p.transaction_date DESC';
    }
    const [payments] = await db.execute(query, params);
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
});

// PATCH /api/payments/:id - update payment status
router.patch('/:id', authenticate, authorize('hotel_owner','admin'), async (req, res, next) => {
  try {
    const { payment_method, payment_status } = req.body;
    await db.execute('UPDATE payments SET payment_method=?, payment_status=? WHERE payment_id=?', [payment_method, payment_status, req.params.id]);
    res.json({ success: true, message: 'Payment updated.' });
  } catch (error) { next(error); }
});

module.exports = router;
