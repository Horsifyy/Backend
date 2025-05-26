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
  getStudentPoints,
  getHistorialExtras,
  updateHistorialExtras,
getLastEvaluationWithExtras
} = require("../controllers/evaluationController");

const router = express.Router();

router.post("/", registerEvaluation);
router.get("/", getAllEvaluations);

router.get("/exercises/:level", getExercisesByLevel);
router.get("/metrics/:level", getMetricsByLevel);
router.get("/students/:studentId/metrics", getStudentMetrics);
router.get("/students/:studentId/points", getStudentPoints);

router.get("/last/:uid", getLastEvaluation);
router.get("/lastWithExtras/:uid", getLastEvaluationWithExtras);

router.get("/historial/:studentId", getHistorialExtras);
router.patch("/historial/:studentId", updateHistorialExtras);

router.get("/history/:studentId", getPreviousEvaluations); // con filtros

// Estas deben ir al final
router.get("/:id", getEvaluationById);
router.put("/:id", updateEvaluation);
router.delete("/:id", deleteEvaluation);



module.exports = router;

