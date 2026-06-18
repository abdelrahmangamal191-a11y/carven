const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const teachers = await db.prepare(`
    SELECT t.id, u.name, u.phone, t.subject, t.bio,
      (SELECT COUNT(*) FROM courses WHERE teacher_id = t.id) as courses_count
    FROM teachers t JOIN users u ON t.user_id = u.id ORDER BY u.name
  `).all();
  if (db.release) db.release();
  res.json(teachers);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const teacher = await db.prepare(`
    SELECT t.id, u.name, u.phone, t.subject, t.bio
    FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ?
  `).get(req.params.id);
  if (db.release) db.release();
  if (!teacher) return res.status(404).json({ error: 'المدرس غير موجود' });
  res.json(teacher);
});

router.get('/:id/courses', authMiddleware, async (req, res) => {
  const db = await getDb();
  const courses = await db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as students_count,
      (SELECT COUNT(*) FROM sessions WHERE course_id = c.id) as sessions_count
    FROM courses c WHERE teacher_id = ? ORDER BY c.created_at DESC
  `).all(req.params.id);
  if (db.release) db.release();
  res.json(courses);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { subject, bio } = req.body;
  const db = await getDb();
  await db.prepare('UPDATE teachers SET subject=?, bio=? WHERE id=?').run(subject, bio, req.params.id);
  if (db.release) db.release();
  res.json({ message: 'تم التحديث' });
});

module.exports = router;
