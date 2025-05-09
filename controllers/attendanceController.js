const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Registra una asistencia en Firestore y suma puntos al estudiante.
 * Evita duplicados por estudiante/clase/fecha.
 */
const registerAttendance = async (req, res) => {
  try {
    const { studentId, classId, pointsAwarded } = req.body;

    if (!studentId || !classId || typeof pointsAwarded !== "number") {
      return res.status(400).json({ error: "Datos incompletos o inválidos." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Se verifica si ya hay una asistencia registrada hoy
    const existing = await db.collection("attendances")
      .where("studentId", "==", studentId)
      .where("classId", "==", classId)
      .where("date", ">=", admin.firestore.Timestamp.fromDate(today))
      .where("date", "<", admin.firestore.Timestamp.fromDate(tomorrow))
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: "Ya se registró la asistencia para hoy." });
    }

    // Se crea una nueva asistencia
    await db.collection("attendances").add({
      studentId,
      classId,
      date: admin.firestore.Timestamp.now(),
      pointsAwarded,
    });

    // Se suman los puntos al estudiante
    const studentRef = db.collection("students").doc(studentId);
    await studentRef.update({
      points: admin.firestore.FieldValue.increment(pointsAwarded),
    });

    return res.status(200).json({ message: "Asistencia registrada con éxito." });

  } catch (error) {
    console.error("Error registrando asistencia:", error);
    return res.status(500).json({ error: "Error registrando asistencia." });
  }
};

module.exports = { registerAttendance };
