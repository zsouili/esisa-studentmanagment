const express = require('express');
const path = require('path');
const { createDatabaseConnection } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function normalizeStudentPayload(payload) {
  return {
    firstName: String(payload.firstName || '').trim(),
    lastName: String(payload.lastName || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    department: String(payload.department || '').trim(),
    year: Number(payload.year),
  };
}

function validateStudent(student) {
  if (!student.firstName || !student.lastName || !student.email || !student.department) {
    return 'All fields are required.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(student.email)) {
    return 'Please provide a valid email address.';
  }

  if (!Number.isInteger(student.year) || student.year < 1 || student.year > 8) {
    return 'Year must be an integer between 1 and 8.';
  }

  return null;
}

function normalizeModulePayload(payload) {
  return {
    name: String(payload.name || '').trim(),
    coefficient: Number(payload.coefficient),
  };
}

function validateModule(moduleData) {
  if (!moduleData.name) {
    return 'Module name is required.';
  }

  if (!Number.isFinite(moduleData.coefficient) || moduleData.coefficient <= 0) {
    return 'Coefficient must be a positive number.';
  }

  return null;
}

function normalizeNotePayload(payload) {
  return {
    moduleId: Number(payload.moduleId),
    grade: Number(payload.grade),
  };
}

function validateNote(note) {
  if (!Number.isInteger(note.moduleId) || note.moduleId <= 0) {
    return 'Please select a valid module.';
  }

  if (!Number.isFinite(note.grade) || note.grade < 0 || note.grade > 20) {
    return 'Grade must be between 0 and 20.';
  }

  return null;
}

function normalizeTuitionPayload(payload) {
  return {
    totalFees: Number(payload.totalFees),
    paidFees: Number(payload.paidFees),
  };
}

function validateTuition(tuitionData) {
  if (!Number.isFinite(tuitionData.totalFees) || tuitionData.totalFees < 0) {
    return 'Total fees must be a number greater than or equal to 0.';
  }

  if (!Number.isFinite(tuitionData.paidFees) || tuitionData.paidFees < 0) {
    return 'Paid fees must be a number greater than or equal to 0.';
  }

  if (tuitionData.paidFees > tuitionData.totalFees) {
    return 'Paid fees cannot be greater than total fees.';
  }

  return null;
}

async function startServer() {
  const db = await createDatabaseConnection();

  app.get('/api/students', async (_req, res) => {
    const students = await db.all(
      `SELECT s.*,
              ROUND(COALESCE((
                SELECT SUM(n.grade * m.coefficient) / NULLIF(SUM(m.coefficient), 0)
                FROM notes n
                JOIN modules m ON m.id = n.moduleId
                WHERE n.studentId = s.id
              ), 0), 2) AS average,
              COALESCE((SELECT t.totalFees FROM tuition t WHERE t.studentId = s.id), 0) AS totalFees,
              COALESCE((SELECT t.paidFees FROM tuition t WHERE t.studentId = s.id), 0) AS paidFees
       FROM students s
       ORDER BY s.id DESC`
    );
    res.json(students);
  });

  app.get('/api/students/:id', async (req, res) => {
    const student = await db.get('SELECT * FROM students WHERE id = ?', req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    return res.json(student);
  });

  app.post('/api/students', async (req, res) => {
    const student = normalizeStudentPayload(req.body);
    const validationError = validateStudent(student);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const result = await db.run(
        `INSERT INTO students (firstName, lastName, email, department, year)
         VALUES (?, ?, ?, ?, ?)`,
        student.firstName,
        student.lastName,
        student.email,
        student.department,
        student.year
      );

      const createdStudent = await db.get('SELECT * FROM students WHERE id = ?', result.lastID);
      return res.status(201).json(createdStudent);
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'A student with this email already exists.' });
      }
      return res.status(500).json({ message: 'Failed to create student.' });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    const existing = await db.get('SELECT * FROM students WHERE id = ?', req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const student = normalizeStudentPayload(req.body);
    const validationError = validateStudent(student);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      await db.run(
        `UPDATE students
         SET firstName = ?, lastName = ?, email = ?, department = ?, year = ?
         WHERE id = ?`,
        student.firstName,
        student.lastName,
        student.email,
        student.department,
        student.year,
        req.params.id
      );

      const updatedStudent = await db.get('SELECT * FROM students WHERE id = ?', req.params.id);
      return res.json(updatedStudent);
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'A student with this email already exists.' });
      }
      return res.status(500).json({ message: 'Failed to update student.' });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    const result = await db.run('DELETE FROM students WHERE id = ?', req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(204).send();
  });

  app.get('/api/modules', async (_req, res) => {
    const modules = await db.all('SELECT * FROM modules ORDER BY name ASC');
    res.json(modules);
  });

  app.post('/api/modules', async (req, res) => {
    const moduleData = normalizeModulePayload(req.body);
    const validationError = validateModule(moduleData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const result = await db.run(
        'INSERT INTO modules (name, coefficient) VALUES (?, ?)',
        moduleData.name,
        moduleData.coefficient
      );
      const createdModule = await db.get('SELECT * FROM modules WHERE id = ?', result.lastID);
      return res.status(201).json(createdModule);
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'This module already exists.' });
      }
      return res.status(500).json({ message: 'Failed to create module.' });
    }
  });

  app.delete('/api/modules/:id', async (req, res) => {
    const result = await db.run('DELETE FROM modules WHERE id = ?', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Module not found.' });
    }
    return res.status(204).send();
  });

  app.get('/api/students/:id/notes', async (req, res) => {
    const student = await db.get('SELECT id FROM students WHERE id = ?', req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const notes = await db.all(
      `SELECT n.studentId, n.moduleId, n.grade, n.updatedAt, m.name AS moduleName, m.coefficient
       FROM notes n
       JOIN modules m ON m.id = n.moduleId
       WHERE n.studentId = ?
       ORDER BY m.name ASC`,
      req.params.id
    );

    const averageRow = await db.get(
      `SELECT ROUND(COALESCE(SUM(n.grade * m.coefficient) / NULLIF(SUM(m.coefficient), 0), 0), 2) AS average
       FROM notes n
       JOIN modules m ON m.id = n.moduleId
       WHERE n.studentId = ?`,
      req.params.id
    );

    return res.json({ notes, average: averageRow?.average || 0 });
  });

  app.post('/api/students/:id/notes', async (req, res) => {
    const studentId = Number(req.params.id);
    const student = await db.get('SELECT id FROM students WHERE id = ?', studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const note = normalizeNotePayload(req.body);
    const validationError = validateNote(note);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const moduleData = await db.get('SELECT id FROM modules WHERE id = ?', note.moduleId);
    if (!moduleData) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    await db.run(
      `INSERT INTO notes (studentId, moduleId, grade, updatedAt)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(studentId, moduleId)
       DO UPDATE SET grade = excluded.grade, updatedAt = CURRENT_TIMESTAMP`,
      studentId,
      note.moduleId,
      note.grade
    );

    const savedNote = await db.get(
      `SELECT n.studentId, n.moduleId, n.grade, n.updatedAt, m.name AS moduleName, m.coefficient
       FROM notes n
       JOIN modules m ON m.id = n.moduleId
       WHERE n.studentId = ? AND n.moduleId = ?`,
      studentId,
      note.moduleId
    );

    return res.status(201).json(savedNote);
  });

  app.delete('/api/students/:id/notes/:moduleId', async (req, res) => {
    const studentId = Number(req.params.id);
    const moduleId = Number(req.params.moduleId);

    const result = await db.run(
      'DELETE FROM notes WHERE studentId = ? AND moduleId = ?',
      studentId,
      moduleId
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    return res.status(204).send();
  });

  app.get('/api/students/:id/tuition', async (req, res) => {
    const studentId = Number(req.params.id);
    const student = await db.get('SELECT id FROM students WHERE id = ?', studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const tuitionData = await db.get(
      `SELECT studentId, totalFees, paidFees, ROUND(totalFees - paidFees, 2) AS dueFees, updatedAt
       FROM tuition
       WHERE studentId = ?`,
      studentId
    );

    return res.json(
      tuitionData || { studentId, totalFees: 0, paidFees: 0, dueFees: 0, updatedAt: null }
    );
  });

  app.put('/api/students/:id/tuition', async (req, res) => {
    const studentId = Number(req.params.id);
    const student = await db.get('SELECT id FROM students WHERE id = ?', studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const tuitionData = normalizeTuitionPayload(req.body);
    const validationError = validateTuition(tuitionData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    await db.run(
      `INSERT INTO tuition (studentId, totalFees, paidFees, updatedAt)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(studentId)
       DO UPDATE SET totalFees = excluded.totalFees,
                     paidFees = excluded.paidFees,
                     updatedAt = CURRENT_TIMESTAMP`,
      studentId,
      tuitionData.totalFees,
      tuitionData.paidFees
    );

    const savedTuitionData = await db.get(
      `SELECT studentId, totalFees, paidFees, ROUND(totalFees - paidFees, 2) AS dueFees, updatedAt
       FROM tuition
       WHERE studentId = ?`,
      studentId
    );

    return res.json(savedTuitionData);
  });

  app.listen(port, () => {
    console.log(`ESISA Student Management app running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
