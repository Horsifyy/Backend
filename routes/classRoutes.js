const express = require("express");
const { 
  scheduleClass, 
  getAllScheduledClasses,
  getClassesByStudent 
} = require("../controllers/classController");

const router = express.Router();


router.get("/", getAllScheduledClasses);  // Profesor ve todas las clases
router.post("/schedule", scheduleClass);  // Programar clase
router.get("/student/:studentId", getClassesByStudent);  // Estudiante ve sus clases


module.exports = router;
