// test/setupFirebase.js
const admin = require("firebase-admin");
const serviceAccount = require("../firebase-credentials.json");

// Inicializar Firebase si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Cierra las instancias de Firebase al finalizar las pruebas
afterAll(async () => {
  await Promise.all(admin.apps.map((app) => app.delete()));
});
