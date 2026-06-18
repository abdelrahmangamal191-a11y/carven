const { Pool } = require('pg');

let pool = null;

function prepare(client, sql) {
  return {
    get(...params) {
      const q = params.length > 0
        ? client.query(sql, params)
        : client.query(sql);
      return q.then(r => r.rows[0] || undefined);
    },
    all(...params) {
      const q = params.length > 0
        ? client.query(sql, params)
        : client.query(sql);
      return q.then(r => r.rows);
    },
    run(...params) {
      return client.query(sql, params).then(r => ({
        changes: r.rowCount,
        lastInsertRowid: r.rows[0]?.id || 0,
      }));
    },
  };
}

async function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await initTables();
  }
  const client = await pool.connect();
  return {
    prepare: (sql) => prepare(client, sql),
    exec: (sql) => client.query(sql).then(r => r),
    run: (sql, params) => client.query(sql, params),
    transaction: (fn) => {
      return async (...args) => {
        await client.query('BEGIN');
        try {
          const result = await fn(...args);
          await client.query('COMMIT');
          return result;
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        }
      };
    },
    release: () => client.release(),
  };
}

async function initTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        bio TEXT,
        photo TEXT
      );
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        grade TEXT,
        parent_phone TEXT
      );
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        grade TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        notes TEXT
      );
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      );
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK(status IN ('present','absent','late')) DEFAULT 'absent',
        UNIQUE(session_id, student_id)
      );
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        method TEXT DEFAULT 'cash',
        note TEXT,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        duration_seconds INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create default admin
    const bcrypt = require('bcryptjs');
    const existing = await client.query("SELECT id FROM users WHERE phone='01000000000'");
    if (existing.rows.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await client.query(
        "INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4)",
        ['مدير النظام', '01000000000', hash, 'admin']
      );
    }
  } finally {
    client.release();
  }
}

module.exports = { getDb };
