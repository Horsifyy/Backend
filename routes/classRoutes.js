const express = require("express");
const { 
  scheduleClass, 
  getAllScheduledClasses,
  getClassesByStudent 
} = require("../controllers/classController");

const router = express.Router();

router.post("/", scheduleClass);  // Programar clase
router.get("/", getAllScheduledClasses);  // Profesor ve todas las clases
router.get("/student/:studentId", getClassesByStudent);  // Estudiante ve sus clases

module.exports = router;
