const admin = require("firebase-admin");
const auth = admin.auth();
const { getAuth } = require("firebase-admin/auth");
const db = admin.firestore();

const registerStudent = async (req, res) => {
  try {
    const { name, email, lupeLevel, role } = req.body;
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar el token y obtener el usuario
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log(`Estudiante autenticado en Firebase: ${uid}`);

    // Asignar rol en Firebase Auth
    await getAuth().setCustomUserClaims(uid, { role: "Estudiante" });

    // Guardar en Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.set({
      uid,
      name,
      email,
      role: "Estudiante",
      lupeLevel,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      points: 0,
    });

    res.status(201).json({
      message: "Estudiante registrado correctamente",
      uid,
    });
  } catch (error) {
    console.error("Error en registro de estudiante:", error);
    res.status(500).json({ error: error.message });
  }
};

const registerTeacher = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar el token y obtener el usuario
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log(`Docente autenticado en Firebase: ${uid}`);

    // Asignar rol en Firebase Auth
    await getAuth().setCustomUserClaims(uid, { role: "Docente" });

    // Guardar en Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.set({
      uid,
      name,
      email,
      role: "Docente",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Docente registrado correctamente",
      uid,
    });
  } catch (error) {
    console.error("Error en registro de docente:", error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { idToken, expectedRole } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Token no proporcionado" });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    console.log(`UID autenticado: ${uid}`);

    // Verificar si el usuario existe en Firestore
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userData = userDoc.data();
    
    // Verificar que el rol coincida con el esperado
    if (userData.role.trim().toLowerCase() !== expectedRole.trim().toLowerCase()) {
      return res.status(403).json({
        error: `Acceso denegado: Se esperaba ${expectedRole}, pero el usuario tiene rol ${userData.role}`,
      });
    }

    // Actualizar claims si es necesario
    const userAuth = await getAuth().getUser(uid);
    const customClaims = userAuth.customClaims || {};
    
    if (!customClaims.role || customClaims.role !== userData.role) {
      await getAuth().setCustomUserClaims(uid, { role: userData.role });
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: decodedToken.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        lupeLevel: userData.lupeLevel,
      },
    });
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ error: "El correo y la nueva contraseña son obligatorios." });
    }

    const user = await getAuth().getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const userRef = admin.firestore().collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log("⚠️ Usuario no encontrado en Firestore. Creando perfil...");

      await userRef.set({
        name: user.displayName || "Usuario Sin Nombre",
        email: user.email,
        role: "Estudiante", // O ajusta el rol según tu lógica
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await getAuth().updateUser(user.uid, { password: newPassword });
    await userRef.update({ lastPasswordReset: new Date().toISOString() });

    res.status(200).json({
      message: "La contraseña ha sido restablecida. Vuelve a iniciar sesión.",
    });
  } catch (error) {
    console.error("Error en la recuperación de contraseña:", error);
    res.status(500).json({ error: error.message });
  }
};

// Agregar esta función a tu archivo authController.js

const getStudentsByTeacher = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar el token y obtener el usuario
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const teacherUid = decodedToken.uid;
    
    // Verificar que sea un docente
    const teacherDoc = await db.collection("users").doc(teacherUid).get();
    
    if (!teacherDoc.exists || teacherDoc.data().role !== "Docente") {
      return res.status(403).json({ error: "Acceso denegado: Solo los docentes pueden acceder a esta información" });
    }
    
    // Obtener todos los estudiantes
    const studentsSnapshot = await db.collection("users")
      .where("role", "==", "Estudiante")
      .orderBy("name")
      .get();
    
    const students = [];
    studentsSnapshot.forEach(doc => {
      const studentData = doc.data();
      students.push({
        id: doc.id,
        name: studentData.name,
        lupeLevel: studentData.lupeLevel
      });
    });

    res.status(200).json({
      students
    });
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { registerStudent, registerTeacher, login, resetPassword, getStudentsByTeacher};