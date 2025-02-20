const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// 🔹 Usa tus credenciales JSON de Firebase
const serviceAccount = require('./firebase-credentials.json');

if (!admin.apps.length) {
  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
