const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const courses = await db.prepare(`
    SELECT c.*, u.name as teacher_name, t.subject,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as students_count
    FROM courses c JOIN teachers t ON c.teacher_id = t.id
    JOIN users u ON t.user_id = u.id ORDER BY c.created_at DESC
  `).all();
  if (db.release) db.release();
  res.json(courses);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const course = await db.prepare(`
    SELECT c.*, u.name as teacher_name
    FROM courses c JOIN teachers t ON c.teacher_id=t.id JOIN users u ON t.user_id=u.id WHERE c.id=?
  `).get(req.params.id);
  if (db.release) db.release();
  if (!course) return res.status(404).json({ error: 'الكورس غير موجود' });
  res.json(course);
});

router.get('/:id/students', authMiddleware, async (req, res) => {
  const db = await getDb();
  const students = await db.prepare(`
    SELECT s.id, u.name, u.phone, s.grade, e.enrolled_at,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE student_id=s.id AND course_id=?) as paid
    FROM enrollments e JOIN students s ON e.student_id=s.id
    JOIN users u ON s.user_id=u.id WHERE e.course_id=?
  `).all(req.params.id, req.params.id);
  if (db.release) db.release();
  res.json(students);
});

router.get('/:id/sessions', async (req, res) => {
  const db = await getDb();
  const sessions = await db.prepare('SELECT * FROM sessions WHERE course_id=? ORDER BY date DESC').all(req.params.id);
  if (db.release) db.release();
  res.json(sessions);
});

router.get('/:id/videos', authMiddleware, async (req, res) => {
  const db = await getDb();
  const videos = await db.prepare('SELECT * FROM videos WHERE course_id=? ORDER BY uploaded_at DESC').all(req.params.id);
  if (db.release) db.release();
  res.json(videos);
});

router.post('/', authMiddleware, teacherOrAdmin, async (req, res) => {
  const { teacher_id, title, subject, grade, price, description } = req.body;
  if (!title || !subject || !grade || !price) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = await getDb();
  const result = await db.prepare(
    'INSERT INTO courses (teacher_id, title, subject, grade, price, description) VALUES (?,?,?,?,?,?)'
  ).run(teacher_id, title, subject, grade, price, description || '');
  if (db.release) db.release();
  res.json({ id: result.lastInsertRowid, message: 'تم إضافة الكورس' });
});

router.put('/:id', authMiddleware, teacherOrAdmin, async (req, res) => {
  const { title, subject, grade, price, description } = req.body;
  const db = await getDb();
  await db.prepare('UPDATE courses SET title=?,subject=?,grade=?,price=?,description=? WHERE id=?')
    .run(title, subject, grade, price, description, req.params.id);
  if (db.release) db.release();
  res.json({ message: 'تم التحديث' });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  await db.prepare('DELETE FROM courses WHERE id=?').run(req.params.id);
  if (db.release) db.release();
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
