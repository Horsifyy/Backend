const admin = require('firebase-admin');
const auth = admin.auth();
const { getAuth } = require("firebase-admin/auth");


const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const userRecord = await getAuth().createUser({
            email,
            password,
            displayName: name,
        });

        await getAuth().updateUser(userRecord.uid, {
            displayName: name,
        });

        await getAuth().setCustomUserClaims(userRecord.uid, { role });

        const userRef = admin.firestore().collection("users").doc(userRecord.uid);
        await userRef.set({
            name,
            email,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: "Usuario registrado correctamente", uid: userRecord.uid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "Token no proporcionado" });
        }

        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const userAuth = await getAuth().getUser(uid);
        const customClaims = userAuth.customClaims || {}; 
        const role = customClaims.role || "Estudiante"; 

        const userRef = admin.firestore().collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {

            const newUser = {
                name: userAuth.displayName || "Usuario Sin Nombre",
                email: userAuth.email,
                role: role, 
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await userRef.set(newUser);

            return res.status(201).json({
                message: "Usuario creado en Firestore automáticamente",
                user: newUser
            });
        }

        res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: userDoc.data(),
        });
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ error: "El correo y la nueva contraseña son obligatorios." });
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


module.exports = { register, login, resetPassword };

