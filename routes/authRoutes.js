const express = require('express');
const router = express.Router();
const { registerStudent, registerTeacher, login, resetPassword, getStudentsByTeacher} = require("../controllers/authController");

router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get('/students', getStudentsByTeacher);

module.exports = router;



