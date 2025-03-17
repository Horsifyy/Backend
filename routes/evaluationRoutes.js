const express = require("express");
const { registerEvaluation, getPerformanceMetrics, generateReport } = require("../controllers/evaluationController");

const router = express.Router();

// Ruta para registrar una evaluación según el Método LUPE
router.post("/", registerEvaluation);

// Ruta para obtener métricas de desempeño de un estudiante
router.get("/metrics/:studentId", getPerformanceMetrics);

// Ruta para generar un reporte de evaluación y progreso
router.get("/report/:studentId", generateReport);

module.exports = router;
