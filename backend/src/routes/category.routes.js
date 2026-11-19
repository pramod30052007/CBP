const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const [cats] = await db.execute('SELECT * FROM job_categories ORDER BY category_name');
    res.json({ success:true, data:cats });
  } catch(e) { next(e); }
});

module.exports = router;
