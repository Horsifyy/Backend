require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar rutas de autenticación

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes); // Registrar rutas de autenticación

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
