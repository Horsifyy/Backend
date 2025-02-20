const admin = require('firebase-admin');
const auth = admin.auth();
const { getAuth } = require("firebase-admin/auth");


const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // 🔹 Crear usuario en Firebase Authentication
        const userRecord = await getAuth().createUser({
            email,
            password,
            displayName: name,
        });

        console.log("✅ Usuario creado en Firebase Authentication:", userRecord.uid);

        // 🔹 Asignar rol en Firebase Authentication
        await getAuth().updateUser(userRecord.uid, {
            displayName: name,
        });

        await getAuth().setCustomUserClaims(userRecord.uid, { role });

        // 🔹 Guardar usuario en Firestore
        const userRef = admin.firestore().collection("users").doc(userRecord.uid);
        await userRef.set({
            name,
            email,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("✅ Usuario registrado en Firestore con rol:", role);

        res.status(201).json({ message: "Usuario registrado correctamente", uid: userRecord.uid });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "Token no proporcionado" });
        }

        // 🔹 Verificar el token de Firebase Authentication
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 🔹 Obtener los "custom claims" del usuario (incluido su rol)
        const userAuth = await getAuth().getUser(uid);
        const customClaims = userAuth.customClaims || {}; // Si no tiene custom claims, devolver un objeto vacío
        const role = customClaims.role || "Estudiante"; // Si no tiene rol, asignar "Estudiante" por defecto

        console.log(`📌 Rol obtenido de Firebase Authentication para ${userAuth.email}:`, role);

        // 🔹 Buscar el usuario en Firestore
        const userRef = admin.firestore().collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log("⚠️ Usuario no encontrado en Firestore. Creando nuevo usuario...");

            // 🔹 Crear usuario en Firestore con el rol de Firebase Authentication
            const newUser = {
                name: userAuth.displayName || "Usuario Sin Nombre",
                email: userAuth.email,
                role: role, // Usa el rol de Firebase Authentication
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await userRef.set(newUser);

            return res.status(201).json({
                message: "Usuario creado en Firestore automáticamente",
                user: newUser
            });
        }

        console.log("✅ Usuario encontrado en Firestore:", userDoc.data());

        // 🔹 Devolver los datos del usuario
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: userDoc.data(),
        });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};

// 📌 RECUPERACIÓN DE CONTRASEÑA (Envía email de recuperación)
const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Enviar correo de restablecimiento de contraseña
        await auth.generatePasswordResetLink(email);

        res.status(200).json({ message: 'Correo de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, resetPassword };

