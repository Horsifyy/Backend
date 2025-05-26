const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

// Mock de controladores
const scheduleClass = (req, res) => res.status(201).json({ message: 'Clase programada' });
const getAllScheduledClasses = (req, res) => res.status(200).json([{ classId: '1', teacher: 'Profe1' }]);
const getClassesByStudent = (req, res) => res.status(200).json([{ classId: '2', studentId: req.params.studentId }]);
const getAllTeachers = (req, res) => res.status(200).json([{ teacherId: 't1', name: 'Profe1' }]);
const getUnavailableTimes = (req, res) => res.status(200).json(['10:00', '14:00']);
const rescheduleClass = (req, res) => res.status(200).json({ message: `Clase ${req.params.classId} reprogramada` });
const cancelClass = (req, res) => res.status(200).json({ message: `Clase ${req.params.classId} cancelada` });

// Rutas
const router = express.Router();

router.get("/", getAllScheduledClasses);
router.post("/schedule", scheduleClass);
router.get("/student/:studentId", getClassesByStudent);
router.get("/unavailable-times/:date", getUnavailableTimes);
router.get("/teachers", getAllTeachers);
router.put("/reschedule/:classId", rescheduleClass);
router.delete("/cancel/:classId", cancelClass);

app.use('/classes', router);

describe('Rutas de clases - tests básicos', () => {
  test('GET /classes debe devolver todas las clases programadas', async () => {
    const res = await request(app).get('/classes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /classes/schedule debe programar una clase', async () => {
    const res = await request(app).post('/classes/schedule').send({ studentId: 's1', teacherId: 't1', date: '2025-06-01', time: '10:00' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Clase programada');
  });

  test('GET /classes/student/:studentId debe devolver las clases del estudiante', async () => {
    const res = await request(app).get('/classes/student/s123');
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('studentId', 's123');
  });

  test('GET /classes/unavailable-times/:date debe devolver horarios ocupados', async () => {
    const res = await request(app).get('/classes/unavailable-times/2025-06-01');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /classes/teachers debe devolver todos los profesores', async () => {
    const res = await request(app).get('/classes/teachers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /classes/reschedule/:classId debe reprogramar una clase', async () => {
    const res = await request(app).put('/classes/reschedule/c1').send({ date: '2025-06-02', time: '11:00' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Clase c1 reprogramada');
  });

  test('DELETE /classes/cancel/:classId debe cancelar una clase', async () => {
    const res = await request(app).delete('/classes/cancel/c1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Clase c1 cancelada');
  });
});

