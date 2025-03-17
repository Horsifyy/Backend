const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const serviceAccount = require("./firebase-credentials.json");

// 🔹 Inicializar Firebase correctamente
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Rutas organizadas correctamente
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/evaluations", evaluationRoutes);

// Mostrar rutas registradas después de definirlas
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`✅ Ruta registrada: ${r.route.path}`);
  }
});

// 🔹 Servidor en el puerto definido
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(` Servidor corriendo en http://192.168.2.7:${PORT}`);
});
