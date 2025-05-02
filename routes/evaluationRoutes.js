// routes/evaluationRoutes.js

const express = require("express");
const {
  registerEvaluation,
  getAllEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getStudentMetrics,
  getPreviousEvaluations,
  getExercisesByLevel,   // Asegúrate de exportar esto desde evaluationController.js
  getMetricsByLevel,
  getLastEvaluation,
} = require("../controllers/evaluationController");

const router = express.Router();

// 🔹 Rutas específicas (antes de la genérica '/:id')
router.post("/", registerEvaluation);                                 // Registrar una evaluación
router.get("/", getAllEvaluations);                                   // Obtener todas las evaluaciones
router.get("/exercises/:level", getExercisesByLevel);                 // Obtener ejercicios por nivel
router.get('/metrics/:level', getMetricsByLevel); 
router.get("/students/:studentId/metrics", getStudentMetrics);        // Métricas de un estudiante
router.get("/students/:studentId/evaluations", getPreviousEvaluations); // Historial de evaluaciones
router.get('/last/:uid', getLastEvaluation);
router.get("/history/:studentId", getPreviousEvaluations);    // Historial con ?range=week|month

// 🔹 Rutas basadas en ID
router.get("/:id", getEvaluationById);    // Obtener una evaluación por ID
router.put("/:id", updateEvaluation);     // Actualizar una evaluación
router.delete("/:id", deleteEvaluation);  // Eliminar una evaluación

module.exports = router;

