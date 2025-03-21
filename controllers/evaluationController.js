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

// 🔹 Obtener métricas del estudiante (nuevo endpoint)
const getStudentMetrics = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        if (!studentId) {
            return res.status(400).json({ error: "ID de estudiante requerido" });
        }
        
        // Obtener el documento del estudiante para confirmar nivel LUPE
        const studentDoc = await admin.firestore().collection("students").doc(studentId).get();
        
        if (!studentDoc.exists) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        const studentData = studentDoc.data();
        const lupeLevel = studentData.lupeLevel || "No asignado";
        
        // Obtener las evaluaciones del estudiante ordenadas por fecha
        const evaluationsSnapshot = await admin.firestore()
            .collection("evaluations")
            .where("studentId", "==", studentId)
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();
        
        // Si no hay evaluaciones, devolver datos predeterminados
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
        
        // Procesar últimas evaluaciones para obtener métricas
        const evaluations = evaluationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const latestEvaluation = evaluations[0]; // La más reciente
        
        // Calcular puntuación promedio basada en nivel LUPE
        let metrics = [];
        let totalScore = 0;
        let count = 0;
        
        if (lupeLevel === "Amarillo") {
            // Métricas para nivel Amarillo
            if (latestEvaluation.balanceYEquilibrio) {
                const balanceData = latestEvaluation.balanceYEquilibrio;
                
                // Extraer métricas relevantes según el nivel
                metrics = [
                    { name: "Control del caballo", value: String(balanceData.controlCaballo || 0) },
                    { name: "Postura", value: String(balanceData.postura || 0) },
                    { name: "Movimientos corporales", value: String(balanceData.movimientosCorporales || 0) },
                    { name: "Control de la respiración", value: String(balanceData.controlRespiracion || 0) }
                ];
                
                // Calcular puntuación promedio
                const values = metrics.map(m => parseFloat(m.value) || 0);
                totalScore = values.reduce((sum, val) => sum + val, 0);
                count = values.length;
            }
        } else if (lupeLevel === "Azul") {
            // Métricas para nivel Azul
            if (latestEvaluation.conduccion) {
                const conduccionData = latestEvaluation.conduccion;
                
                metrics = [
                    { name: "Técnica de riendas", value: String(conduccionData.tecnicaRiendas || 0) },
                    { name: "Apoyos", value: String(conduccionData.apoyos || 0) },
                    { name: "Transiciones", value: String(conduccionData.transiciones || 0) },
                    { name: "Figuras", value: String(conduccionData.figuras || 0) }
                ];
                
                const values = metrics.map(m => parseFloat(m.value) || 0);
                totalScore = values.reduce((sum, val) => sum + val, 0);
                count = values.length;
            }
        } else if (lupeLevel === "Rojo") {
            // Métricas para nivel Rojo
            if (latestEvaluation.equitacionCentrada) {
                const centradaData = latestEvaluation.equitacionCentrada;
                
                metrics = [
                    { name: "Equilibrio", value: String(centradaData.equilibrio || 0) },
                    { name: "Armonía", value: String(centradaData.armonia || 0) },
                    { name: "Expresión", value: String(centradaData.expresion || 0) },
                    { name: "Precisión", value: String(centradaData.precision || 0) }
                ];
                
                const values = metrics.map(m => parseFloat(m.value) || 0);
                totalScore = values.reduce((sum, val) => sum + val, 0);
                count = values.length;
            }
        }
        
        // Si no se encontraron métricas específicas, usar valores predeterminados
        if (metrics.length === 0) {
            metrics = [
                { name: "Control del caballo", value: "0" },
                { name: "Postura", value: "0" },
                { name: "Movimientos corporales", value: "0" },
                { name: "Control de la respiración", value: "0" }
            ];
        }
        
        // Calcular puntuación promedio
        const averageScore = count > 0 ? (totalScore / count).toFixed(2) : "0.00";
        
        res.status(200).json({
            averageScore,
            metrics
        });
    } catch (error) {
        console.error("Error al obtener métricas:", error);
        res.status(500).json({ error: error.message });
    }
};

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