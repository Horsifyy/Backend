// server.js
const express = require("express");
const cors = require("cors");
const { admin } = require("./config/firebase"); // ✅ Usa la instancia exportada
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const classRoutes = require("./routes/classRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/classes", classRoutes);

// Mostrar rutas registradas
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`✅ ${Object.keys(r.route.methods).join(", ").toUpperCase()} -> ${r.route.path}`);
  }
});

// 🔹 Servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://192.168.2.7:${PORT}`);
});
