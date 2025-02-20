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
        const { email } = req.body;

        await auth.generatePasswordResetLink(email);

        res.status(200).json({ message: 'Correo de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, resetPassword };

