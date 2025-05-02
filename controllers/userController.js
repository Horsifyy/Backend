const { db } = require('../firebase');
const admin = require('firebase-admin');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const { role } = req.query; // Permite filtrar por rol

    let usersRef = db.collection("users");
    
    if (role) {
      if (role !== "Estudiante" && role !== "Docente") {
        return res.status(400).json({ error: "Rol inválido. Usa 'Estudiante' o 'Docente'." });
      }
      usersRef = usersRef.where("role", "==", role); // Filtrar solo por el rol indicado
    }

    const snapshot = await usersRef.get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
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

    // Obtener los datos del usuario y incluir el campo 'lupeLevel' si es un estudiante
    const userData = userDoc.data();
    const responseData = {
      id: uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      lupeLevel: userData.lupeLevel || null  // Solo si es un estudiante
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};


const createUser = async (req, res) => {
  try {
    const { uid, name, email, role, lupeLevel } = req.body;

    // Validar que todos los campos sean obligatorios
    if (!uid || !name || !email || !role) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar roles permitidos
    if (role !== "Estudiante" && role !== "Docente") {
      return res.status(400).json({ error: "Rol inválido. Debe ser 'Estudiante' o 'Docente'." });
    }

    const userRef = db.collection("users").doc(uid);

    let userData = {
      name,
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (role === "Estudiante") {
      if (!lupeLevel) {
        return res.status(400).json({ error: "El campo 'lupeLevel' es obligatorio para estudiantes." });
      }
      userData.lupeLevel = lupeLevel;
    }


    await userRef.set(userData);

    res.status(201).json({ message: "Usuario registrado en Firestore correctamente." });
  } catch (error) {
    console.error("Error al crear usuario en Firestore:", error);
    res.status(500).json({ error: "Error al crear usuario en Firestore" });
  }
};


// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "No autorizado" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Agregamos el usuario decodificado

    // Obtener el rol del usuario desde Firestore
    const userRef = db.collection("users").doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: "Usuario no encontrado en Firestore" });
    }

    req.user.role = userDoc.data().role; // Agregar el rol a la solicitud
    next();
  } catch (error) {
    console.error("Error en verificación de token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

// Obtener datos del usuario autenticado
const getCurrentUser = async (req, res) => {
  try {
    const uid = req.user.uid; // viene del middleware verifyToken
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const data = userDoc.data();
    const response = {
      id: uid,
      name: data.name,
      email: data.email,
      role: data.role,
      lupeLevel: data.lupeLevel || null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};


module.exports = { getUsers, getUserById, createUser, verifyToken, getCurrentUser };