const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, verifyToken, getCurrentUser, editUserProfile, getAllTeachers, updateStudentPoints } = require("../controllers/userController");

router.get("/users", verifyToken, getUsers); 
router.get("/users/:uid", verifyToken, getUserById); 
router.post("/create-user", verifyToken, createUser); 
router.get('/me', verifyToken, getCurrentUser);
router.put("/edit/:userId", verifyToken, editUserProfile);
router.get('/teachers', verifyToken, getAllTeachers);
router.put("/points/:id", verifyToken, updateStudentPoints);



module.exports = router;