const admin = require("firebase-admin");
const db = admin.firestore();

// Obtener todas las recompensas activas del catálogo
const getCatalog = async (req, res) => {
  try {
    const snapshot = await db.collection("rewardsCatalog")
      .where("active", "==", true)
      .get();

    const rewards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json(rewards);
  } catch (error) {
    console.error("Error al obtener el catálogo:", error);
    return res.status(500).json({ error: "Error al obtener el catálogo." });
  }
};

// Canjear una recompensa
const redeemReward = async (req, res) => {
  try {
    const { studentId, rewardId } = req.body;

    if (!studentId || !rewardId) {
      return res.status(400).json({ error: "Faltan datos necesarios." });
    }

    const rewardDoc = await db.collection("rewardsCatalog").doc(rewardId).get();

    if (!rewardDoc.exists || !rewardDoc.data().active) {
      return res.status(404).json({ error: "Recompensa no encontrada o inactiva." });
    }

    const rewardData = rewardDoc.data();
    const pointsRequired = rewardData.pointsRequired;

    const studentRef = db.collection("users").doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }

    const studentData = studentDoc.data();
    const currentPoints = studentData.points || 0;

    if (currentPoints < pointsRequired) {
      return res.status(400).json({ error: "Puntos insuficientes para canjear esta recompensa." });
    }

    // Descontar puntos
    await studentRef.update({
      points: admin.firestore.FieldValue.increment(-pointsRequired),
    });

    // Registrar canje
    await db.collection("redeemedRewards").add({
      studentId,
      rewardId,
      rewardName: rewardData.name,
      pointsSpent: pointsRequired,
      date: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({ message: "Recompensa canjeada con éxito." });
  } catch (error) {
    console.error("Error al canjear recompensa:", error);
    return res.status(500).json({ error: "Error al canjear recompensa." });
  }
};

module.exports = {
  getCatalog,
  redeemReward
};