const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'students.db');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

function isValidStudentPayload(payload) {
  return (
    payload &&
    typeof payload.name === 'string' &&
    payload.name.trim().length >= 2 &&
    typeof payload.course === 'string' &&
    payload.course.trim().length >= 2 &&
    Number.isInteger(payload.year) &&
    payload.year >= 1 &&
    payload.year <= 6
  );
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        id: this.lastID,
        changes: this.changes
      });
    });
  });
}

function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK (length(name) >= 2),
      course TEXT NOT NULL CHECK (length(course) >= 2),
      year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const countRow = await getOne('SELECT COUNT(*) AS count FROM students');

  if (countRow.count === 0) {
    await runQuery(
      `INSERT INTO students (name, course, year) VALUES
        ('Aachal', 'B.Tech', 3),
        ('Rahul', 'BCA', 2),
        ('Priya', 'M.Tech', 1)`
    );
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Student Management API',
    endpoints: [
      'GET /students',
      'GET /students/:id',
      'POST /students',
      'PUT /students/:id',
      'DELETE /students/:id'
    ]
  });
});

app.get('/students', async (req, res, next) => {
  try {
    const students = await getAll('SELECT * FROM students ORDER BY id ASC');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
});

app.get('/students/:id', async (req, res, next) => {
  try {
    const student = await getOne('SELECT * FROM students WHERE id = ?', [req.params.id]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
});

app.get('/stats', async (req, res, next) => {
  try {
    const summary = await getOne(
      'SELECT COUNT(*) AS studentCount, COUNT(DISTINCT course) AS courseCount FROM students'
    );

    const yearCounts = await getAll(
      'SELECT year, COUNT(*) AS total FROM students GROUP BY year ORDER BY year ASC'
    );

    const recentStudents = await getAll(
      'SELECT id, name, course, year FROM students ORDER BY created_at DESC LIMIT 5'
    );

    res.status(200).json({
      success: true,
      data: {
        studentCount: summary.studentCount || 0,
        courseCount: summary.courseCount || 0,
        yearCounts,
        recentStudents
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/students', async (req, res, next) => {
  try {
    const { name, course, year } = req.body;

    if (!isValidStudentPayload(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student data. Required fields: name (string), course (string), year (integer 1-6)'
      });
    }

    const result = await runQuery(
      'INSERT INTO students (name, course, year) VALUES (?, ?, ?)',
      [name.trim(), course.trim(), year]
    );

    const newStudent = await getOne('SELECT * FROM students WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent
    });
  } catch (error) {
    next(error);
  }
});

app.put('/students/:id', async (req, res, next) => {
  try {
    const student = await getOne('SELECT * FROM students WHERE id = ?', [req.params.id]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!isValidStudentPayload(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student data. Required fields: name (string), course (string), year (integer 1-6)'
      });
    }

    await runQuery(
      'UPDATE students SET name = ?, course = ?, year = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.body.name.trim(), req.body.course.trim(), req.body.year, req.params.id]
    );

    const updatedStudent = await getOne('SELECT * FROM students WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/students/:id', async (req, res, next) => {
  try {
    const student = await getOne('SELECT * FROM students WHERE id = ?', [req.params.id]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await runQuery('DELETE FROM students WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
})();
