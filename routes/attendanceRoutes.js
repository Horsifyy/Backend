const express = require("express");
const router = express.Router();
const { registerAttendance } = require("../controllers/attendanceController");

// POST /api/attendances/register
router.post("/register", registerAttendance);

module.exports = router;
