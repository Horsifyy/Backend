const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, editUserProfile, verifyToken } = require("../controllers/userController");

// Obtener todos los usuarios (solo usuarios autenticados)
router.get("/users", verifyToken, getUsers); 

// Obtener un usuario por UID (solo usuarios autenticados)
router.get("/users/:uid", verifyToken, getUserById); 

// Crear un nuevo usuario (solo usuarios autenticados)
router.post("/create-user", verifyToken, createUser); 

// Editar el perfil del usuario (solo usuarios autenticados)
// Permite cambiar solo 'name' y 'email'
router.put("/users/edit/:userId", verifyToken, editUserProfile);

module.exports = router;
