const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// POST /api/bookings
router.post('/', authenticate, authorize('hotel_owner'), async (req, res, next) => {
  try {
    const { worker_id, category_id, booking_date, start_time, end_time, num_workers, hourly_rate, notes } = req.body;
    const [hotels] = await db.execute('SELECT hotel_id,hotel_name FROM hotels WHERE owner_id=?', [req.user.user_id]);
    if (!hotels.length) return res.status(400).json({ success:false, message:'Create a hotel profile first.' });
    const { hotel_id, hotel_name } = hotels[0];

    const ms = (t) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
    const total_hours = (ms(end_time) - ms(start_time)) / 60;
    if (total_hours <= 0) return res.status(400).json({ success:false, message:'End time must be after start time.' });
    const total_amount = total_hours * (Number(hourly_rate)||0) * (Number(num_workers)||1);

    // Double-booking check
    const [clash] = await db.execute(
      `SELECT booking_id FROM bookings WHERE worker_id=? AND booking_date=? AND booking_status NOT IN ('rejected','cancelled') AND NOT (end_time<=? OR start_time>=?)`,
      [worker_id, booking_date, start_time, end_time]
    );
    if (clash.length) return res.status(409).json({ success:false, message:'Worker already booked for this time slot.' });

    const [r] = await db.execute(
      `INSERT INTO bookings(hotel_id,worker_id,category_id,booking_date,start_time,end_time,total_hours,hourly_rate,total_amount,num_workers,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [hotel_id, worker_id, category_id||null, booking_date, start_time, end_time, total_hours, hourly_rate||0, total_amount, num_workers||1, notes||'']
    );
    await db.execute('INSERT INTO payments(booking_id,amount) VALUES(?,?)', [r.insertId, total_amount]);

    // Notify worker
    const [wRows] = await db.execute('SELECT u.user_id FROM workers w JOIN users u ON w.user_id=u.user_id WHERE w.worker_id=?', [worker_id]);
    if (wRows.length) {
      await db.execute('INSERT INTO notifications(user_id,message) VALUES(?,?)',
        [wRows[0].user_id, `📋 New booking request from ${hotel_name} on ${booking_date}`]);
      const io = req.app.get('io');
      if (io) io.to(`user_${wRows[0].user_id}`).emit('new_notification', { message:`New booking from ${hotel_name}` });
    }
    res.status(201).json({ success:true, message:'Booking created!', booking_id:r.insertId, total_amount });
  } catch(e) { next(e); }
});

// GET /api/bookings
router.get('/', authenticate, async (req, res, next) => {
  try {
    let sql = `
      SELECT b.*, h.hotel_name, h.city AS hotel_city, h.address AS hotel_address,
             u.full_name AS worker_name, u.phone AS worker_phone,
             jc.category_name, jc.icon,
             p.payment_status, p.payment_method
      FROM bookings b
      JOIN hotels h ON b.hotel_id=h.hotel_id
      JOIN workers w ON b.worker_id=w.worker_id
      JOIN users u ON w.user_id=u.user_id
      LEFT JOIN job_categories jc ON b.category_id=jc.category_id
      LEFT JOIN payments p ON b.booking_id=p.booking_id
    `;
    const params = [];
    if (req.user.role === 'hotel_owner') {
      const [h] = await db.execute('SELECT hotel_id FROM hotels WHERE owner_id=?', [req.user.user_id]);
      if (!h.length) return res.json({ success:true, data:[] });
      sql += ' WHERE b.hotel_id=?'; params.push(h[0].hotel_id);
    } else if (req.user.role === 'worker') {
      const [w] = await db.execute('SELECT worker_id FROM workers WHERE user_id=?', [req.user.user_id]);
      if (!w.length) return res.json({ success:true, data:[] });
      sql += ' WHERE b.worker_id=?'; params.push(w[0].worker_id);
    }
    sql += ' ORDER BY b.created_at DESC';
    const [rows] = await db.execute(sql, params);
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    const valid = ['pending','accepted','rejected','confirmed','in_progress','completed','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success:false, message:'Invalid status.' });

    const [rows] = await db.execute(
      `SELECT b.*, h.owner_id, w.user_id AS worker_user_id FROM bookings b
       JOIN hotels h ON b.hotel_id=h.hotel_id JOIN workers w ON b.worker_id=w.worker_id WHERE b.booking_id=?`, [id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Booking not found.' });
    const bk = rows[0];

    const isOwner  = req.user.role==='hotel_owner' && req.user.user_id===bk.owner_id;
    const isWorker = req.user.role==='worker'      && req.user.user_id===bk.worker_user_id;
    const isAdmin  = req.user.role==='admin';
    if (!isOwner && !isWorker && !isAdmin) return res.status(403).json({ success:false, message:'Not authorised.' });
    if (isWorker && !['accepted','rejected'].includes(status)) return res.status(403).json({ success:false, message:'Workers can only accept or reject.' });

    await db.execute('UPDATE bookings SET booking_status=? WHERE booking_id=?', [status, id]);
    if (status==='completed') await db.execute("UPDATE payments SET payment_status='completed' WHERE booking_id=?", [id]);

    const notifyId = isWorker ? bk.owner_id : bk.worker_user_id;
    await db.execute('INSERT INTO notifications(user_id,message) VALUES(?,?)',
      [notifyId, `Booking #${id} has been ${status}`]);
    const io = req.app.get('io');
    if (io) io.to(`user_${notifyId}`).emit('booking_updated', { booking_id:id, status });
    res.json({ success:true, message:`Booking ${status}!` });
  } catch(e) { next(e); }
});

module.exports = router;
