const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'center_secret_2024';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'غير مصرح' });
  const token = header.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'توكن غير صالح' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'للمسؤولين فقط' });
  next();
}

function teacherOrAdmin(req, res, next) {
  if (!['admin','teacher'].includes(req.user.role)) return res.status(403).json({ error: 'غير مصرح' });
  next();
}

module.exports = { authMiddleware, adminOnly, teacherOrAdmin };
