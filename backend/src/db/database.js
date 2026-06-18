const path = require('path');
const fs = require('fs');

if (process.env.DATABASE_URL) {
  module.exports = require('./database-pg');
  return;
}

const DB_PATH = path.join(__dirname, '../../database.sqlite');

let db = null;
let SQL = null;

function prepare(statement) {
  const stmt = db.prepare(statement);
  return {
    get(...params) {
      if (params.length > 0) stmt.bind(params);
      if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.free();
        return result;
      }
      stmt.free();
      return undefined;
    },
    all(...params) {
      if (params.length > 0) stmt.bind(params);
      const results = [];
      while (stmt.step()) results.push(stmt.getAsObject());
      stmt.free();
      return results;
    },
    run(...params) {
      db.run(statement, params);
      stmt.free();
      const rid = db.exec("SELECT last_insert_rowid() as id");
      const lastInsertRowid = rid[0]?.values[0]?.[0] || 0;
      saveDb();
      return { changes: db.getRowsModified(), lastInsertRowid };
    },
  };
}

function wrapDb(rawDb) {
  return {
    prepare: (sql) => prepare(sql),
    exec: (sql) => rawDb.exec(sql),
    run: (sql, params) => { rawDb.run(sql, params); saveDb(); },
    transaction: (fn) => (...args) => {
      db.run("BEGIN TRANSACTION");
      try {
        fn(...args);
        db.run("COMMIT");
        saveDb();
      } catch (e) {
        db.run("ROLLBACK");
        throw e;
      }
    },
  };
}

function saveDb() {
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('فشل حفظ قاعدة البيانات:', e.message);
  }
}

function getDb() {
  if (db) return wrapDb(db);
  if (!dbPromise) dbPromise = initDb();
  return dbPromise;
}

async function initDb() {
  if (!SQL) {
    const initSqlJs = require('sql.js');
    SQL = await initSqlJs();
  }
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run("PRAGMA journal_mode=WAL");
  db.run("PRAGMA foreign_keys=ON");
  initTables();
  return wrapDb(db);
}

function initTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL, bio TEXT, photo TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grade TEXT, parent_phone TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    title TEXT NOT NULL, subject TEXT NOT NULL, grade TEXT NOT NULL,
    price REAL NOT NULL, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL, date DATETIME NOT NULL, duration_minutes INTEGER DEFAULT 60, notes TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK(status IN ('present','absent','late')) DEFAULT 'absent',
    UNIQUE(session_id, student_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    amount REAL NOT NULL, method TEXT DEFAULT 'cash', note TEXT, paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL, filename TEXT NOT NULL, duration_seconds INTEGER, uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const bcrypt = require('bcryptjs');
  const stmt = db.prepare("SELECT id FROM users WHERE phone='01000000000'");
  const existing = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)",
      ['مدير النظام', '01000000000', hash, 'admin']);
    saveDb();
  }
}

let dbPromise = null;

module.exports = { getDb };
