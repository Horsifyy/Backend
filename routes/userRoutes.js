const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, verifyToken } = require("../controllers/userController");

router.get("/users", verifyToken, getUsers); 
router.get("/users/:uid", verifyToken, getUserById); 
router.post("/create-user", verifyToken, createUser); 

module.exports = router;
