const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const db = await getDb();
  const payments = await db.prepare(`
    SELECT p.*, u.name as student_name, c.title as course_title
    FROM payments p JOIN students s ON p.student_id=s.id
    JOIN users u ON s.user_id=u.id JOIN courses c ON p.course_id=c.id
    ORDER BY p.paid_at DESC LIMIT 100
  `).all();
  if (db.release) db.release();
  res.json(payments);
});

router.post('/', authMiddleware, teacherOrAdmin, async (req, res) => {
  const { student_id, course_id, amount, method, note } = req.body;
  if (!student_id || !course_id || !amount) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = await getDb();
  const result = await db.prepare(
    'INSERT INTO payments (student_id, course_id, amount, method, note) VALUES (?,?,?,?,?)'
  ).run(student_id, course_id, amount, method || 'cash', note || '');
  if (db.release) db.release();
  res.json({ id: result.lastInsertRowid, message: 'تم تسجيل الدفعة' });
});

router.get('/course/:course_id/summary', authMiddleware, async (req, res) => {
  const db = await getDb();
  const summary = await db.prepare(`
    SELECT COUNT(DISTINCT student_id) as paying_students,
      COALESCE(SUM(amount), 0) as total_collected,
      (SELECT COUNT(*) FROM enrollments WHERE course_id=?) as total_enrolled,
      (SELECT price FROM courses WHERE id=?) as course_price
    FROM payments WHERE course_id=?
  `).get(req.params.course_id, req.params.course_id, req.params.course_id);
  if (db.release) db.release();
  res.json(summary);
});

router.get('/stats', authMiddleware, async (req, res) => {
  const db = await getDb();
  const r = (sql) => db.prepare(sql).get().then(r => r.v);
  let total_revenue, this_month, total_students, total_courses, total_teachers;
  if (process.env.DATABASE_URL) {
    total_revenue = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments").get()).v;
    this_month = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE to_char(paid_at, 'YYYY-MM')=to_char(CURRENT_TIMESTAMP, 'YYYY-MM')").get()).v;
    total_students = (await db.prepare('SELECT COUNT(*)::int as v FROM students').get()).v;
    total_courses = (await db.prepare('SELECT COUNT(*)::int as v FROM courses').get()).v;
    total_teachers = (await db.prepare('SELECT COUNT(*)::int as v FROM teachers').get()).v;
  } else {
    total_revenue = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments").get()).v;
    this_month = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE strftime('%Y-%m', paid_at)=strftime('%Y-%m','now')").get()).v;
    total_students = (await db.prepare('SELECT COUNT(*) as v FROM students').get()).v;
    total_courses = (await db.prepare('SELECT COUNT(*) as v FROM courses').get()).v;
    total_teachers = (await db.prepare('SELECT COUNT(*) as v FROM teachers').get()).v;
  }
  if (db.release) db.release();
  res.json({ total_revenue, this_month, total_students, total_courses, total_teachers });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  await db.prepare('DELETE FROM payments WHERE id=?').run(req.params.id);
  if (db.release) db.release();
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
