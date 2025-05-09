const { db } = require("../firebase");

// 🔹 Programar una clase (estudiante)
const scheduleClass = async (req, res) => {
  try {
    const { studentId, date, time } = req.body;

    if (!studentId || !date || !time) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Crear nueva clase en la colección 'classes'
    const classData = {
      studentId,
      date,
      time,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    // Guardar en Firestore
    const classRef = await db.collection('classes').add(classData);

    // Devolver respuesta exitosa con ID
    return res.status(201).json({
      success: true,
      id: classRef.id,
      message: 'Clase programada con éxito'
    });
  } catch (error) {
    console.error('Error al programar clase:', error);
    return res.status(500).json({ 
      error: 'Error al programar la clase: ' + error.message 
    });
  }
};

// Obtener todas las clases programadas
const getAllScheduledClasses = async (req, res) => {
  try {
    const classesSnapshot = await db.collection('classes').get();
    const classes = [];
    
    classesSnapshot.forEach(doc => {
      classes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Error al obtener clases:', error);
    return res.status(500).json({ error: 'Error al obtener las clases programadas' });
  }
};

// Obtener clases por estudiante
const getClassesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ error: 'ID de estudiante requerido' });
    }
    
    const classesSnapshot = await db.collection('classes')
      .where('studentId', '==', studentId)
      .get();
    
    const classes = [];
    
    classesSnapshot.forEach(doc => {
      classes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Error al obtener clases del estudiante:', error);
    return res.status(500).json({ error: 'Error al obtener las clases del estudiante' });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const snapshot = await db.collection('teachers').get();
    const teachers = [];

    snapshot.forEach(doc => {
      teachers.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(teachers);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los profesores.' });
  }
};

const getUnavailableTimes = async (req, res) => {
  const { date } = req.params;
  try {
    const snapshot = await db.collection('classes').where('date', '==', date).get();
    const takenTimes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      takenTimes.push(data.time);
    });

    return res.status(200).json(takenTimes);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los horarios ocupados.' });
  }
};


module.exports = {
  scheduleClass,
  getAllScheduledClasses,
  getClassesByStudent,
  getAllTeachers,
  getUnavailableTimes,
};
