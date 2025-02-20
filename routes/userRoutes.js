const express = require('express');
const { getUsers, getUserById, createUser, verifyToken } = require('../controllers/userController');

const router = express.Router();

router.get('/users', verifyToken, getUsers);

router.get('/users/:uid', verifyToken, getUserById);

router.post('/users', createUser);

module.exports = router;
