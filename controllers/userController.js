const { db } = require('../firebase');
const admin = require('firebase-admin');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let usersRef = db.collection("users");
    if (role) {
      if (role !== "Estudiante" && role !== "Docente") {
        return res.status(400).json({ error: "Rol inválido. Usa 'Estudiante' o 'Docente'." });
      }
      usersRef = usersRef.where("role", "==", role);
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

    const userData = userDoc.data();
    const responseData = {
      id: uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      lupeLevel: userData.lupeLevel || null,
      points: userData.points || 0
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear un usuario
const createUser = async (req, res) => {
  try {
    const { uid, name, email, role, lupeLevel } = req.body;

    if (!uid || !name || !email || !role) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

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
      userData.points = 0; // 👈 Inicializar puntos
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
    req.user = decodedToken;

    const userRef = db.collection("users").doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: "Usuario no encontrado en Firestore" });
    }

    req.user.role = userDoc.data().role;
    next();
  } catch (error) {
    console.error("Error en verificación de token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

// Obtener datos del usuario autenticado
const getCurrentUser = async (req, res) => {
  try {
    const uid = req.user.uid;
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
      points: data.points || 0,
      profilePicture: data.profilePicture || null,
      averageScore: data.averageScore || null
    };

    res.status(200).json(response);
  } catch (error) { 
    console.error('Error al obtener el usuario autenticado:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

// Editar perfil de usuario
const editUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, profilePicture, lupeLevel } = req.body;

    if (name === undefined && email === undefined && profilePicture === undefined && lupeLevel === undefined) {
  return res.status(400).json({ error: "Debes proporcionar al menos un campo para actualizar" });
}


    const updateData = {};
if (name !== undefined) updateData.name = name;
if (email !== undefined) updateData.email = email;
if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
if (lupeLevel !== undefined) updateData.lupeLevel = lupeLevel;


    const userRef = db.collection("users").doc(userId);
    await userRef.update(updateData);

    res.status(200).json({ message: "Perfil actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

// Obtener todos los docentes
const getAllTeachers = async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'Docente')
      .get();

    const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ teachers });
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los profesores.' });
  }
};

// Modificar puntos de un estudiante
const updateStudentPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body; // delta puede ser positivo o negativo

    if (typeof delta !== 'number') {
      return res.status(400).json({ error: "'delta' debe ser un número" });
    }

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    const userData = userDoc.data();
    if (userData.role !== "Estudiante") {
      return res.status(400).json({ error: "Solo se pueden modificar puntos a estudiantes" });
    }

    const currentPoints = userData.points || 0;
    const newPoints = currentPoints + delta;

    await userRef.update({ points: newPoints });

    res.status(200).json({
      message: "Puntos actualizados correctamente",
      points: newPoints
    });
  } catch (error) {
    console.error("Error al modificar puntos del estudiante:", error);
    res.status(500).json({ error: "Error al modificar puntos" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  verifyToken,
  getCurrentUser,
  editUserProfile,
  getAllTeachers,
  updateStudentPoints
};
