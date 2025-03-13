const express = require("express");
const { registerEvaluation, getPerformanceMetrics, generateReport } = require("../controllers/evaluationController");

const router = express.Router();

// Ruta para registrar una evaluaci�n seg�n el M�todo LUPE
router.post("/evaluations", registerEvaluation);

// Ruta para obtener m�tricas de desempe�o de un estudiante
router.get("/evaluations/metrics/:studentId", getPerformanceMetrics);

// Ruta para generar un reporte de evaluaci�n y progreso
router.get("/evaluations/report/:studentId", generateReport);

module.exports = router;