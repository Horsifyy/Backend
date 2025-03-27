const admin = require("firebase-admin");

// 🔹 Registrar una evaluación según el Método LUPE
const registerEvaluation = async (req, res) => {
    try {
        const { studentId, lupeLevel, balanceYEquilibrio, conduccion, equitacionCentrada, comments } = req.body;
        
        if (!studentId || !lupeLevel) {
            return res.status(400).json({ error: "studentId y lupeLevel son obligatorios" });
        }
        
        let evaluation = { 
            studentId, 
            lupeLevel, 
            comments, 
            createdAt: admin.firestore.FieldValue.serverTimestamp() 
        };
        
        if (lupeLevel === "Amarillo") evaluation.balanceYEquilibrio = balanceYEquilibrio;
        if (lupeLevel === "Azul") evaluation.conduccion = conduccion;
        if (lupeLevel === "Rojo") evaluation.equitacionCentrada = equitacionCentrada;
        
        const docRef = await admin.firestore().collection("evaluations").add(evaluation);
        res.status(201).json({ message: "Evaluación registrada", evaluation: { id: docRef.id, ...evaluation } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Obtener todas las evaluaciones
const getAllEvaluations = async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("evaluations").get();
        const evaluations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Obtener una evaluación por ID
const getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await admin.firestore().collection("evaluations").doc(id).get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: "Evaluación no encontrada" });
        }
        
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Actualizar una evaluación
const updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const { balanceYEquilibrio, conduccion, equitacionCentrada, comments } = req.body;
        
        const updateData = {
            balanceYEquilibrio,
            conduccion,
            equitacionCentrada,
            comments,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await admin.firestore().collection("evaluations").doc(id).update(updateData);
        
        res.status(200).json({ message: "Evaluación actualizada con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Eliminar una evaluación
const deleteEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        
        await admin.firestore().collection("evaluations").doc(id).delete();
        
        res.status(200).json({ message: "Evaluación eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStudentMetrics = async (req, res) => {
    const { studentId } = req.params;
  
    // Validación
    if (!studentId) {
      return res.status(400).json({ error: "ID de estudiante requerido" });
    }
  
    // Obtener evaluaciones
    const evaluationsSnapshot = await admin.firestore()
      .collection("evaluations")
      .where("studentId", "==", studentId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
  
    if (evaluationsSnapshot.empty) {
      return res.status(200).json({
        averageScore: "0.00",
        metrics: [
          { name: "Control del caballo", value: "0" },
          { name: "Postura", value: "0" },
          { name: "Movimientos corporales", value: "0" },
          { name: "Control de la respiración", value: "0" }
        ]
      });
    }
  
    const latestEvaluation = evaluationsSnapshot.docs[0].data();
    const lupeLevel = latestEvaluation.lupeLevel || "No asignado";
  
    // Cálculo de métricas
    const metrics = calculateMetrics(latestEvaluation, lupeLevel);
    
    const averageScore = calculateAverageScore(metrics);
  
    res.status(200).json({
      averageScore,
      metrics,
    });
  };
  
  function calculateMetrics(evaluation, lupeLevel) {
    let metrics = [];
    switch (lupeLevel) {
      case "Amarillo":
        metrics = [
          { name: "Equilibrio estático", value: evaluation.balanceYEquilibrio },
          { name: "Equilibrio dinámico", value: evaluation.balanceYEquilibrio * 0.9 },
          { name: "Control postural", value: evaluation.balanceYEquilibrio * 0.8 },
          { name: "Estabilidad", value: evaluation.balanceYEquilibrio * 0.7 }
        ];
        break;
      case "Azul":
        metrics = [
          { name: "Control del caballo", value: evaluation.conduccion },
          { name: "Precisión de movimientos", value: evaluation.conduccion * 0.9 },
          { name: "Comunicación con el caballo", value: evaluation.conduccion * 0.8 },
          { name: "Fluidez de movimientos", value: evaluation.conduccion * 0.7 }
        ];
        break;
      case "Rojo":
        metrics = [
          { name: "Postura", value: evaluation.equitacionCentrada },
          { name: "Movimientos corporales", value: evaluation.equitacionCentrada * 0.9 },
          { name: "Respiración", value: evaluation.equitacionCentrada * 0.8 },
          { name: "Alineamiento", value: evaluation.equitacionCentrada * 0.7 }
        ];
        break;
    }
    return metrics;
  }
  
  function calculateAverageScore(metrics) {
    const totalScore = metrics.reduce((acc, metric) => acc + parseFloat(metric.value), 0);
    return (totalScore / metrics.length).toFixed(2);
  }
  

// 🔹 Obtener evaluaciones previas del estudiante
const getPreviousEvaluations = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        if (!studentId) {
            return res.status(400).json({ error: "ID de estudiante requerido" });
        }
        
        const evaluationsSnapshot = await admin.firestore()
            .collection("evaluations")
            .where("studentId", "==", studentId)
            .orderBy("createdAt", "desc")
            .get();
        
        const evaluations = evaluationsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Convertir timestamp a formato de fecha legible
            const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
            
            return {
                id: doc.id,
                ...data,
                createdAt
            };
        });
        
        res.status(200).json(evaluations);
    } catch (error) {
        console.error("Error al obtener evaluaciones previas:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    registerEvaluation,
    getAllEvaluations,
    getEvaluationById,
    updateEvaluation,
    deleteEvaluation,
    getStudentMetrics,
    getPreviousEvaluations
};