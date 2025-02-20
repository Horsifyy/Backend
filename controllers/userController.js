const { db } = require('../firebase');
const admin = require('firebase-admin');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por UID
const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear usuario con datos adicionales (después de registro en Firebase)
const createUser = async (req, res) => {
  try {
    const { uid, name, email, role, lupeLevel } = req.body;
    const userRef = db.collection('users').doc(uid);
    await userRef.set({ name, email, role, lupeLevel });

    res.status(201).json({ message: 'Usuario registrado en Firestore' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario en Firestore' });
  }
};

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "No autorizado" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = { getUsers, getUserById, createUser, verifyToken };


