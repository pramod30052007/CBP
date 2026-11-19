const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'WorkerBook_JWT_2024';

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success:false, message:'Access denied. No token.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch(e) {
    res.status(401).json({ success:false, message:'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success:false, message:'Access denied. Insufficient permissions.' });
  }
  next();
};

module.exports = { authenticate, authorize };
