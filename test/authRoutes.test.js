const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

// Mocks para los controladores
const registerStudent = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
  return res.status(201).json({ message: 'Estudiante registrado', email });
};

const registerTeacher = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
  return res.status(201).json({ message: 'Profesor registrado', email });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (email === 'user@test.com' && password === '123456') {
    return res.status(200).json({ message: 'Login exitoso', token: 'fake-jwt-token' });
  }
  return res.status(401).json({ error: 'Credenciales inválidas' });
};

const resetPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  return res.status(200).json({ message: `Correo de recuperación enviado a ${email}` });
};

const getStudentsByTeacher = (req, res) => {
  return res.status(200).json([{ studentId: 's1', name: 'Alumno 1' }, { studentId: 's2', name: 'Alumno 2' }]);
};

// Configuramos rutas
const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get('/students', getStudentsByTeacher);

app.use('/auth', router);

// Tests
describe('Pruebas de rutas de autenticación', () => {
  test('POST /auth/register/student registra un estudiante', async () => {
    const res = await request(app).post('/auth/register/student').send({ email: 'estudiante@test.com', password: '123456' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Estudiante registrado');
  });

  test('POST /auth/register/teacher registra un profesor', async () => {
    const res = await request(app).post('/auth/register/teacher').send({ email: 'profe@test.com', password: '123456' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Profesor registrado');
  });

  test('POST /auth/login con credenciales válidas devuelve token', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /auth/login con credenciales inválidas da error 401', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
  });

  test('POST /auth/reset-password envía correo recuperación', async () => {
    const res = await request(app).post('/auth/reset-password').send({ email: 'user@test.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /auth/students devuelve lista de alumnos', async () => {
    const res = await request(app).get('/auth/students');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

