const express = require('express');
const router = express.Router();
const { register, login, resetPassword } = require('../controllers/authController');

router.post('/register', register);        // Registrar usuario
router.post('/login', login);              // Iniciar sesión
router.post('/reset-password', resetPassword); // Enviar correo de recuperación

module.exports = router;

