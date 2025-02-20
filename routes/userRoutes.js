const express = require('express');
const { getUsers, getUserById, createUser, verifyToken } = require('../controllers/userController');

const router = express.Router();

// 🔹 Obtener todos los usuarios (Solo accesible con token)
router.get('/users', verifyToken, getUsers);

// 🔹 Obtener usuario por UID
router.get('/users/:uid', verifyToken, getUserById);

// 🔹 Crear usuario después del registro
router.post('/users', createUser);

module.exports = router;
