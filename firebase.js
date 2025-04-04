// config/firebase.js
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../firebase-credentials.json"); // ✅ Ruta correcta

// 🔹 Inicializar solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

module.exports = { admin, db };
