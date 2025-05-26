const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

// Mock de los controladores
const getCatalog = (req, res) => {
  res.status(200).json([
    { id: '1', name: 'Recompensa 1', pointsRequired: 100 },
    { id: '2', name: 'Recompensa 2', pointsRequired: 200 }
  ]);
};

const redeemReward = (req, res) => {
  const { userId, rewardId } = req.body;
  if (!userId || !rewardId) {
    return res.status(400).json({ error: 'Faltan datos para canjear la recompensa' });
  }
  return res.status(200).json({ message: 'Recompensa canjeada exitosamente' });
};

// Definición de rutas simuladas
const router = express.Router();
router.get('/catalog', getCatalog);
router.post('/redeem', redeemReward);

app.use(router);

describe('Pruebas de las rutas de recompensas', () => {
  test('GET /catalog devuelve 200 y una lista de recompensas activas', async () => {
    const res = await request(app).get('/catalog');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /redeem devuelve 200 si se canjea correctamente', async () => {
    const body = { userId: 'user123', rewardId: 'reward456' };
    const res = await request(app).post('/redeem').send(body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Recompensa canjeada exitosamente');
  });

  test('POST /redeem devuelve 400 si faltan datos', async () => {
    const res = await request(app).post('/redeem').send({ userId: 'user123' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

