const register = (req, res) => {
    res.send('Registro de usuario');
};

const login = (req, res) => {
    res.send('Inicio de sesión');
};

const resetPassword = (req, res) => {
    res.send('Recuperación de contraseña');
};

module.exports = { register, login, resetPassword };
