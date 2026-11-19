const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50', [req.user.user_id]);
    res.json({ success:true, data:rows, unread_count: rows.filter(n=>!n.is_read).length });
  } catch(e) { next(e); }
});

router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await db.execute('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.user_id]);
    res.json({ success:true });
  } catch(e) { next(e); }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await db.execute('UPDATE notifications SET is_read=1 WHERE notification_id=? AND user_id=?', [req.params.id, req.user.user_id]);
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
