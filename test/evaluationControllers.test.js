const request = require("supertest");
const express = require("express");
const admin = require("firebase-admin");
const {
  registerEvaluation,
  getAllEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getStudentMetrics,
} = require("../controllers/evaluationController");

const app = express();
app.use(express.json());

// Rutas para las pruebas
app.post("/evaluations", registerEvaluation);
app.get("/evaluations", getAllEvaluations);
app.get("/evaluations/:id", getEvaluationById);
app.put("/evaluations/:id", updateEvaluation);
app.delete("/evaluations/:id", deleteEvaluation);
app.get("/metrics/:studentId", getStudentMetrics);

// 🔹 Variables auxiliares
let evaluationId;

// 🔹 Prueba: Registrar una evaluación
describe("Evaluaciones - Método LUPE", () => {
  it("Debe registrar una evaluación", async () => {
    const response = await request(app)
      .post("/evaluations")
      .send({
        studentId: "student_123",
        lupeLevel: "Amarillo",
        balanceYEquilibrio: 8,
        comments: "Buen desempeño",
      });

    expect(response.status).toBe(201);
    expect(response.body.evaluation).toHaveProperty("id");
    evaluationId = response.body.evaluation.id; // Guardar ID para pruebas siguientes
  });

  // 🔹 Prueba: Obtener todas las evaluaciones
  it("Debe devolver todas las evaluaciones", async () => {
    const response = await request(app).get("/evaluations");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // 🔹 Prueba: Obtener una evaluación por ID
  it("Debe devolver una evaluación por ID", async () => {
    const response = await request(app).get(`/evaluations/${evaluationId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", evaluationId);
  });

  // 🔹 Prueba: Actualizar una evaluación
  it("Debe actualizar una evaluación existente", async () => {
    const response = await request(app)
      .put(`/evaluations/${evaluationId}`)
      .send({
        balanceYEquilibrio: 9,
        comments: "Desempeño mejorado",
      });

    console.log("Respuesta del servidor:", response.body); // Imprime la respuesta completa para depuración

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Evaluación actualizada con éxito");
  });

  // 🔹 Prueba: Obtener métricas de un estudiante
  it("Debe calcular las métricas del estudiante", async () => {
    const response = await request(app).get("/metrics/student_123");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("averageScore");
    expect(response.body.metrics).toHaveLength(4);
  });

  // 🔹 Prueba: Eliminar una evaluación
  it("Debe eliminar una evaluación", async () => {
    const response = await request(app).delete(`/evaluations/${evaluationId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Evaluación eliminada con éxito");
  });

  // 🔹 Prueba: Manejar error al obtener una evaluación no existente
  it("Debe devolver error si la evaluación no existe", async () => {
    const response = await request(app).get("/evaluations/fake_id");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Evaluación no encontrada");
  });
});
