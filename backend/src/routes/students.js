const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const db = await getDb();
  const students = await db.prepare(`
    SELECT s.id, u.name, u.phone, s.grade, s.parent_phone, u.created_at
    FROM students s JOIN users u ON s.user_id = u.id
    ORDER BY u.name
  `).all();
  if (db.release) db.release();
  res.json(students);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const student = await db.prepare(`
    SELECT s.id, u.name, u.phone, s.grade, s.parent_phone, u.created_at
    FROM students s JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(req.params.id);
  if (db.release) db.release();
  if (!student) return res.status(404).json({ error: 'الطالب غير موجود' });
  res.json(student);
});

router.get('/:id/courses', authMiddleware, async (req, res) => {
  const db = await getDb();
  const courses = await db.prepare(`
    SELECT c.*, u.name as teacher_name,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE student_id=? AND course_id=c.id) as paid
    FROM enrollments e JOIN courses c ON e.course_id = c.id
    JOIN teachers t ON c.teacher_id = t.id JOIN users u ON t.user_id = u.id
    WHERE e.student_id = ?
  `).all(req.params.id, req.params.id);
  if (db.release) db.release();
  res.json(courses);
});

router.get('/:id/payments', authMiddleware, async (req, res) => {
  const db = await getDb();
  const payments = await db.prepare(`
    SELECT p.*, c.title as course_title
    FROM payments p JOIN courses c ON p.course_id = c.id
    WHERE p.student_id = ? ORDER BY p.paid_at DESC
  `).all(req.params.id);
  if (db.release) db.release();
  res.json(payments);
});

router.get('/:id/attendance', authMiddleware, async (req, res) => {
  const db = await getDb();
  const attendance = await db.prepare(`
    SELECT a.status, sess.title, sess.date, c.title as course_title
    FROM attendance a JOIN sessions sess ON a.session_id = sess.id
    JOIN courses c ON sess.course_id = c.id
    WHERE a.student_id = ? ORDER BY sess.date DESC
  `).all(req.params.id);
  if (db.release) db.release();
  res.json(attendance);
});

router.post('/:id/enroll', authMiddleware, async (req, res) => {
  const { course_id } = req.body;
  const db = await getDb();
  try {
    await db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)').run(req.params.id, course_id);
    if (db.release) db.release();
    res.json({ message: 'تم التسجيل بنجاح' });
  } catch (e) {
    if (db.release) db.release();
    if (e.message?.includes('UNIQUE') || e.message?.includes('duplicate')) return res.status(400).json({ error: 'الطالب مسجل في هذا الكورس مسبقاً' });
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
