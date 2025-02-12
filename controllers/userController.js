const { db } = require('../firebase');

const getUsers = async (req, res) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userRef = db.collection('users').doc();
        await userRef.set({ name, email });
        res.status(201).json({ message: 'Usuario creado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

module.exports = { getUsers, createUser };
