const express = require('express');
const cors = require('cors'); 
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const evaluationRoutes = require("./routes/evaluationRoutes");


const app = express();
app.use(express.json());
app.use(cors({ origin: "*"}));

app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api", evaluationRoutes);

app._router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
      console.log(`Ruta registrada: ${r.route.path}`);
    }
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://192.168.2.20:${PORT}`);
});
