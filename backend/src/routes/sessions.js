const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, teacherOrAdmin, async (req, res) => {
  const { course_id, title, date, duration_minutes, notes } = req.body;
  if (!course_id || !title || !date) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = await getDb();
  const result = await db.prepare(
    'INSERT INTO sessions (course_id, title, date, duration_minutes, notes) VALUES (?,?,?,?,?)'
  ).run(course_id, title, date, duration_minutes || 60, notes || '');

  const students = await db.prepare('SELECT student_id FROM enrollments WHERE course_id=?').all(course_id);
  for (const s of students) {
    try {
      if (process.env.DATABASE_URL) {
        await db.prepare('INSERT INTO attendance (session_id, student_id, status) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING').run(result.lastInsertRowid, s.student_id, 'absent');
      } else {
        await db.prepare('INSERT OR IGNORE INTO attendance (session_id, student_id, status) VALUES (?,?,?)').run(result.lastInsertRowid, s.student_id, 'absent');
      }
    } catch {}
  }
  if (db.release) db.release();
  res.json({ id: result.lastInsertRowid, message: 'تمت إضافة الحصة' });
});

router.get('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const session = await db.prepare('SELECT * FROM sessions WHERE id=?').get(req.params.id);
  if (!session) { if (db.release) db.release(); return res.status(404).json({ error: 'الحصة غير موجودة' }); }
  const attendance = await db.prepare(`
    SELECT a.id, a.status, s.id as student_id, u.name, u.phone
    FROM attendance a JOIN students s ON a.student_id=s.id
    JOIN users u ON s.user_id=u.id WHERE a.session_id=? ORDER BY u.name
  `).all(req.params.id);
  if (db.release) db.release();
  res.json({ ...session, attendance });
});

router.put('/:id/attendance', authMiddleware, teacherOrAdmin, async (req, res) => {
  const { student_id, status } = req.body;
  const db = await getDb();
  await db.prepare('UPDATE attendance SET status=? WHERE session_id=? AND student_id=?').run(status, req.params.id, student_id);
  if (db.release) db.release();
  res.json({ message: 'تم تحديث الحضور' });
});

router.put('/:id/attendance/bulk', authMiddleware, teacherOrAdmin, async (req, res) => {
  const { records } = req.body;
  const db = await getDb();
  for (const r of records) {
    await db.prepare('UPDATE attendance SET status=? WHERE session_id=? AND student_id=?').run(r.status, req.params.id, r.student_id);
  }
  if (db.release) db.release();
  res.json({ message: 'تم تحديث الحضور' });
});

router.delete('/:id', authMiddleware, teacherOrAdmin, async (req, res) => {
  const db = await getDb();
  await db.prepare('DELETE FROM sessions WHERE id=?').run(req.params.id);
  if (db.release) db.release();
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
