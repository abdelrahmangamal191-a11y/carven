const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/database');
const { authMiddleware, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `video_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.mp4', '.mkv', '.avi', '.mov', '.webm'].includes(ext) ? true : cb(new Error('نوع الفيديو غير مدعوم')));
  },
});

router.post('/upload', authMiddleware, teacherOrAdmin, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي فيديو' });
  const { course_id, title } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = await getDb();
  const result = await db.prepare('INSERT INTO videos (course_id, title, filename) VALUES (?,?,?)').run(course_id, title, req.file.filename);
  if (db.release) db.release();
  res.json({ id: result.lastInsertRowid, filename: req.file.filename, message: 'تم رفع الفيديو' });
});

router.delete('/:id', authMiddleware, teacherOrAdmin, async (req, res) => {
  const db = await getDb();
  const video = await db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!video) { if (db.release) db.release(); return res.status(404).json({ error: 'الفيديو غير موجود' }); }
  const filePath = path.join(UPLOAD_DIR, video.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await db.prepare('DELETE FROM videos WHERE id=?').run(req.params.id);
  if (db.release) db.release();
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
