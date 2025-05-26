const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

// Mock para todos los controladores
const getUsers = (req, res) => res.status(200).json([{ uid: '1', name: 'User1' }]);
const getUserById = (req, res) => res.status(200).json({ uid: req.params.uid, name: 'UserMock' });
const createUser = (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Faltan datos' });
  return res.status(201).json({ email, name, uid: 'newId' });
};

const verifyTokenMock = (req, res, next) => next();

const router = express.Router();
router.get('/users', verifyTokenMock, getUsers);
router.get('/users/:uid', verifyTokenMock, getUserById);
router.post('/create-user', verifyTokenMock, createUser);

app.use(router);

describe('Pruebas de las rutas de usuario', () => {
  test('GET /users devuelve 200 y un arreglo de usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /users/:uid devuelve 200 y un objeto de usuario', async () => {
    const res = await request(app).get('/users/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('uid', '123');
  });

  test('POST /create-user devuelve 201 y los datos del usuario creado', async () => {
    const newUser = { email: 'test@test.com', name: 'Test User' };
    const res = await request(app).post('/create-user').send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('email', newUser.email);
  });
});

