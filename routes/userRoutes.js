const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, verifyToken, getCurrentUser } = require("../controllers/userController");

router.get("/users", verifyToken, getUsers); 
router.get("/users/:uid", verifyToken, getUserById); 
router.post("/create-user", verifyToken, createUser); 
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;