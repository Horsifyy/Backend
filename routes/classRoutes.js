const express = require("express");
const {
  scheduleClass,
  getAllScheduledClasses,
  getClassesByStudent,
  getAllTeachers,
  getUnavailableTimes,
  rescheduleClass,
  cancelClass
} = require("../controllers/classController");

const router = express.Router();

router.get("/", getAllScheduledClasses);                      // Profesor ve todas las clases
router.post("/schedule", scheduleClass);                      // Programar clase
router.get("/student/:studentId", getClassesByStudent);       // Estudiante ve sus clases
router.get("/unavailable-times/:date", getUnavailableTimes);  // Ver horas ocupadas en una fecha
router.get("/teachers", getAllTeachers);                      // Ver todos los profesores
router.put("/reschedule/:classId", rescheduleClass);          // Reprogramar clase
router.delete("/cancel/:classId", cancelClass);               // Cancelar clase

module.exports = router;
