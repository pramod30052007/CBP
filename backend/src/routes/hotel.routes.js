const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/hotels
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT h.*,u.full_name AS owner_name FROM hotels h JOIN users u ON h.owner_id=u.user_id ORDER BY h.created_at DESC');
    res.json({ success:true, data:rows });
  } catch(e) { next(e); }
});

// GET /api/hotels/my — own hotel
router.get('/my', authenticate, authorize('hotel_owner'), async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hotels WHERE owner_id=?', [req.user.user_id]);
    res.json({ success:true, data:rows[0]||null });
  } catch(e) { next(e); }
});

// POST /api/hotels
router.post('/', authenticate, authorize('hotel_owner'), async (req, res, next) => {
  try {
    const { hotel_name, address, city, contact_number, description } = req.body;
    if (!hotel_name) return res.status(400).json({ success:false, message:'Hotel name is required.' });
    const [exist] = await db.execute('SELECT hotel_id FROM hotels WHERE owner_id=?', [req.user.user_id]);
    if (exist.length) {
      await db.execute('UPDATE hotels SET hotel_name=?,address=?,city=?,contact_number=?,description=? WHERE owner_id=?',
        [hotel_name,address||'',city||'',contact_number||'',description||'',req.user.user_id]);
      return res.json({ success:true, message:'Hotel updated!' });
    }
    const [r] = await db.execute('INSERT INTO hotels(owner_id,hotel_name,address,city,contact_number,description) VALUES(?,?,?,?,?,?)',
      [req.user.user_id,hotel_name,address||'',city||'',contact_number||'',description||'']);
    res.status(201).json({ success:true, message:'Hotel created!', hotel_id:r.insertId });
  } catch(e) { next(e); }
});

// PUT /api/hotels/:id
router.put('/:id', authenticate, authorize('hotel_owner'), async (req, res, next) => {
  try {
    const { hotel_name, address, city, contact_number, description } = req.body;
    await db.execute('UPDATE hotels SET hotel_name=?,address=?,city=?,contact_number=?,description=? WHERE hotel_id=? AND owner_id=?',
      [hotel_name,address,city,contact_number,description,req.params.id,req.user.user_id]);
    res.json({ success:true, message:'Hotel updated!' });
  } catch(e) { next(e); }
});

module.exports = router;
