require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve website (built frontend)
const webDist = path.join(__dirname, '../../web/dist');
app.use(express.static(webDist));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/videos', require('./routes/videos'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'سيرفر سنتر الدروس يعمل بنجاح ✅' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'خطأ في السيرفر' });
});

async function start() {
  try {
    const { getDb } = require('./db/database');
    await getDb();
    console.log(process.env.DATABASE_URL ? '📦 قاعدة البيانات: PostgreSQL' : '📦 قاعدة البيانات: SQLite');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ السيرفر شغال على: http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('❌ فشل تشغيل السيرفر:', e.message);
    process.exit(1);
  }
}

start();
