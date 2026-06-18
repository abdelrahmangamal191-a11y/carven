const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'center_secret_2024';

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'أدخل رقم الهاتف وكلمة المرور' });
  try {
    const db = await getDb();
    const user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, phone: user.phone } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/register', authMiddleware, async (req, res) => {
  const { name, phone, password, role, subject, bio, grade, parent_phone } = req.body;
  if (!name || !phone || !password || !role) return res.status(400).json({ error: 'بيانات ناقصة' });
  try {
    const db = await getDb();
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.prepare('INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)').run(name, phone, hash, role);
    const userId = result.lastInsertRowid;
    if (role === 'teacher') {
      await db.prepare('INSERT INTO teachers (user_id, subject, bio) VALUES (?, ?, ?)').run(userId, subject || '', bio || '');
    } else if (role === 'student') {
      await db.prepare('INSERT INTO students (user_id, grade, parent_phone) VALUES (?, ?, ?)').run(userId, grade || '', parent_phone || '');
    }
    if (db.release) db.release();
    res.json({ message: 'تم إنشاء الحساب بنجاح', userId });
  } catch (e) {
    if (e.message?.includes('UNIQUE') || e.message?.includes('duplicate')) return res.status(400).json({ error: 'رقم الهاتف مسجل مسبقاً' });
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const db = await getDb();
  const user = await db.prepare('SELECT id, name, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (db.release) db.release();
  res.json(user);
});

module.exports = router;
