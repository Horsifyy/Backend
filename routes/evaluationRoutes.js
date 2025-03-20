const express = require("express");
const { 
    registerEvaluation, 
    getAllEvaluations, 
    getEvaluationById, 
    updateEvaluation, 
    deleteEvaluation 
} = require("../controllers/evaluationController");

const router = express.Router();

// 🔹 Rutas para evaluaciones
router.post("/", registerEvaluation);  // Registrar una evaluación
router.get("/", getAllEvaluations);  // Obtener todas las evaluaciones
router.get("/:id", getEvaluationById);  // Obtener una evaluación por ID
router.put("/:id", updateEvaluation);  // Actualizar una evaluación
router.delete("/:id", deleteEvaluation);  // Eliminar una evaluación

module.exports = router;
