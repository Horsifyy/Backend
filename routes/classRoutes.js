const express = require("express");
const { 
  scheduleClass, 
  getAllScheduledClasses,
  getClassesByStudent,
  registerAttendance 
} = require("../controllers/classController");

const router = express.Router();

router.get("/", getAllScheduledClasses);  // Profesor ve todas las clases
router.post("/", scheduleClass);  // Programar clase
router.get("/student/:studentId", getClassesByStudent);  // Estudiante ve sus clases
router.post("/attendance", registerAttendance);  // Registrar asistencia y sumar puntos

module.exports = router;
