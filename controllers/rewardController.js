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

    console.log('StudentId recibido para canje:', studentId);

    if (!studentId || !rewardId) {
      return res.status(400).json({ error: "Faltan datos necesarios." });
    }

    const rewardDoc = await db.collection("rewardsCatalog").doc(rewardId).get();

    if (!rewardDoc.exists || !rewardDoc.data().active) {
      return res.status(404).json({ error: "Recompensa no encontrada o inactiva." });
    }

    const rewardData = rewardDoc.data();
    const pointsRequired = rewardData.pointsRequired;

    console.log('pointsRequired en recompensa:', pointsRequired);

    const evaluationsSnap = await db.collection("evaluations")
      .where("studentId", "==", studentId)
      .get();
    console.log('Evaluaciones encontradas:', evaluationsSnap.size);

    const redeemedSnap = await db.collection("redeemedRewards")
      .where("studentId", "==", studentId)
      .get();
    console.log('Canjes encontrados:', redeemedSnap.size);

    let pointsSpent = 0;
    redeemedSnap.forEach(doc => {
      pointsSpent += doc.data().pointsSpent || 0;
    });
    console.log('Puntos gastados:', pointsSpent);

    const totalPointsFromEvaluations = evaluationsSnap.size * 10;
    const availablePoints = totalPointsFromEvaluations - pointsSpent;

    console.log('Puntos disponibles:', availablePoints);

    if (availablePoints < pointsRequired) {
      return res.status(400).json({ error: "Puntos insuficientes para canjear esta recompensa." });
    }

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