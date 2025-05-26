const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

// Mocks para todos los controladores
const registerEvaluation = (req, res) => res.status(201).json({ message: 'Evaluación registrada' });
const getAllEvaluations = (req, res) => res.status(200).json([{ id: '1' }, { id: '2' }]);
const getEvaluationById = (req, res) => res.status(200).json({ id: req.params.id, student: 'Estudiante X' });
const updateEvaluation = (req, res) => res.status(200).json({ message: 'Evaluación actualizada' });
const deleteEvaluation = (req, res) => res.status(200).json({ message: 'Evaluación eliminada' });

const getStudentMetrics = (req, res) => res.status(200).json({ studentId: req.params.studentId, metrics: {} });
const getPreviousEvaluations = (req, res) => res.status(200).json([{ id: 'prev1' }, { id: 'prev2' }]);
const getExercisesByLevel = (req, res) => res.status(200).json([{ exercise: 'Ejercicio 1', level: req.params.level }]);
const getMetricsByLevel = (req, res) => res.status(200).json({ level: req.params.level, metrics: {} });
const getLastEvaluation = (req, res) => res.status(200).json({ lastEval: 'última evaluación', uid: req.params.uid });
const getLastEvaluationWithExtras = (req, res) => res.status(200).json({ lastEval: 'última evaluación con extras', uid: req.params.uid });
const getStudentPoints = (req, res) => res.status(200).json({ studentId: req.params.studentId, points: 150 });
const getHistorialExtras = (req, res) => res.status(200).json([{ extra: 'Extra 1' }, { extra: 'Extra 2' }]);
const updateHistorialExtras = (req, res) => res.status(200).json({ message: 'Historial extras actualizado' });

const router = express.Router();

// Definición de rutas
router.post('/', registerEvaluation);
router.get('/', getAllEvaluations);

router.get('/exercises/:level', getExercisesByLevel);
router.get('/metrics/:level', getMetricsByLevel);

router.get('/students/:studentId/metrics', getStudentMetrics);
router.get('/students/:studentId/points', getStudentPoints);

router.get('/last/:uid', getLastEvaluation);
router.get('/lastWithExtras/:uid', getLastEvaluationWithExtras);

router.get('/historial/:studentId', getHistorialExtras);
router.patch('/historial/:studentId', updateHistorialExtras);

router.get('/history/:studentId', getPreviousEvaluations);

router.get('/:id', getEvaluationById);
router.put('/:id', updateEvaluation);
router.delete('/:id', deleteEvaluation);

app.use(router);

describe('Pruebas de las rutas de evaluación', () => {
  test('GET / devuelve 200 y una lista de evaluaciones', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST / registra una evaluación y devuelve 201', async () => {
    const newEval = { studentId: 'abc123', date: '2025-05-25', score: 85 };
    const res = await request(app).post('/').send(newEval);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Evaluación registrada');
  });

  test('GET /exercises/:level devuelve ejercicios para un nivel', async () => {
    const res = await request(app).get('/exercises/avanzado');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('level', 'avanzado');
  });

  test('GET /metrics/:level devuelve métricas para un nivel', async () => {
    const res = await request(app).get('/metrics/basico');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('level', 'basico');
  });

  test('GET /students/:studentId/metrics devuelve métricas de estudiante', async () => {
    const res = await request(app).get('/students/est123/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('studentId', 'est123');
  });

  test('GET /students/:studentId/points devuelve puntos de estudiante', async () => {
    const res = await request(app).get('/students/est123/points');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('points');
  });

  test('GET /last/:uid devuelve última evaluación', async () => {
    const res = await request(app).get('/last/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('uid', 'user123');
  });

  test('GET /lastWithExtras/:uid devuelve última evaluación con extras', async () => {
    const res = await request(app).get('/lastWithExtras/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('uid', 'user123');
  });

  test('GET /historial/:studentId devuelve historial de extras', async () => {
    const res = await request(app).get('/historial/est123');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PATCH /historial/:studentId actualiza historial de extras', async () => {
    const res = await request(app).patch('/historial/est123').send({ extra: 'nuevo extra' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Historial extras actualizado');
  });

  test('GET /history/:studentId devuelve evaluaciones anteriores', async () => {
    const res = await request(app).get('/history/est123');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /:id devuelve evaluación por ID', async () => {
    const res = await request(app).get('/eval123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'eval123');
  });

  test('PUT /:id actualiza evaluación', async () => {
    const res = await request(app).put('/eval123').send({ score: 90 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Evaluación actualizada');
  });

  test('DELETE /:id elimina evaluación', async () => {
    const res = await request(app).delete('/eval123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Evaluación eliminada');
  });
});

