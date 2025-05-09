const { db } = require("../firebase");
const admin = require("firebase-admin");

// 🔹 Programar una clase (estudiante)
const scheduleClass = async (req, res) => {
  try {
    const { studentId, instructorId, date, time } = req.body;

    if (!studentId || !date || !time) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const newClass = {
      studentId,
      instructorId: instructorId || null,
      date,
      time,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("scheduledClasses").add(newClass);
    res.status(201).json({ message: "Clase programada", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Ver todas las clases (profesor)
const getAllScheduledClasses = async (req, res) => {
  try {
    const snapshot = await db.collection("scheduledClasses").orderBy("date").get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Ver clases de un estudiante específico
const getClassesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const snapshot = await db.collection("scheduledClasses")
      .where("studentId", "==", studentId)
      .orderBy("date")
      .get();

    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Registrar asistencia y sumar puntos
const registerAttendance = async (req, res) => {
  try {
    const { studentId, classId } = req.body;

    if (!studentId || !classId) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar si la clase existe
    const classSnapshot = await db.collection("scheduledClasses").doc(classId).get();
    if (!classSnapshot.exists) {
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    // Verificar si el estudiante está programado para esta clase
    const classData = classSnapshot.data();
    if (classData.studentId !== studentId) {
      return res.status(400).json({ error: "El estudiante no está programado para esta clase" });
    }

    // Actualizar la asistencia y sumar puntos
    const pointsToAdd = 10; // Puntos por asistir a la clase

    const studentRef = db.collection("students").doc(studentId);
    await studentRef.update({
      points: admin.firestore.FieldValue.increment(pointsToAdd)
    });

    // Registrar asistencia
    const attendanceRef = db.collection("attendances").doc();
    await attendanceRef.set({
      studentId,
      classId,
      date: admin.firestore.FieldValue.serverTimestamp(),
      pointsAwarded: pointsToAdd
    });

    res.status(200).json({ message: "Asistencia registrada y puntos sumados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  scheduleClass,
  getAllScheduledClasses,
  getClassesByStudent,
  registerAttendance 
};
