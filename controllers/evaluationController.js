const admin = require("firebase-admin");

// Registrar una evaluación según el Método LUPE
const registerEvaluation = async (req, res) => {
    try {
        const { studentId, lupeLevel, balance, conduccion, equitacionCentrada, feedbackEntrenador, comments } = req.body;

        if (!studentId || !lupeLevel || balance === undefined || conduccion === undefined || equitacionCentrada === undefined) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const totalScore = balance + conduccion + equitacionCentrada;

        const evaluation = {
            studentId,
            lupeLevel,
            criteria: {
                balance,  // Balance y equilibrio (nivel amarillo)
                conduccion,  // Conducción emocional (nivel azul)
                equitacionCentrada  // Equitación centrada (nivel rojo)
            },
            totalScore,
            feedbackEntrenador,
            comments,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await admin.firestore().collection("evaluations").add(evaluation);

        res.status(201).json({
            message: "Evaluación registrada",
            evaluation: { id: docRef.id, ...evaluation }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener métricas de desempeño de un estudiante
const getPerformanceMetrics = async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluationsRef = admin.firestore().collection("evaluations");
        const snapshot = await evaluationsRef.where("studentId", "==", studentId).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No se encontraron evaluaciones para este estudiante" });
        }

        let totalEvaluations = 0;
        let totalScore = 0;
        let promedioBalance = 0;
        let promedioConduccion = 0;
        let promedioEquitacion = 0;
        let feedbackList = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            totalEvaluations++;
            totalScore += data.totalScore || 0;

            if (data.criteria) {
                promedioBalance += data.criteria.balance || 0;
                promedioConduccion += data.criteria.conduccion || 0;
                promedioEquitacion += data.criteria.equitacionCentrada || 0;
            }

            if (data.feedbackEntrenador) {
                feedbackList.push(data.feedbackEntrenador);
            }
        });

        res.status(200).json({
            studentId,
            totalEvaluations,
            averageScore: totalEvaluations > 0 ? totalScore / totalEvaluations : 0,
            averageBalance: totalEvaluations > 0 ? promedioBalance / totalEvaluations : 0,
            averageConduccion: totalEvaluations > 0 ? promedioConduccion / totalEvaluations : 0,
            averageEquitacion: totalEvaluations > 0 ? promedioEquitacion / totalEvaluations : 0,
            feedbackList
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generar un reporte de evaluación y progreso
const generateReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluationsRef = admin.firestore().collection("evaluations");
        const snapshot = await evaluationsRef.where("studentId", "==", studentId).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No se encontraron evaluaciones para este estudiante" });
        }

        let evaluations = [];
        snapshot.forEach(doc => {
            evaluations.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({
            message: "Reporte generado",
            studentId,
            totalEvaluations: evaluations.length,
            evaluations
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Exportar funciones
module.exports = {
    registerEvaluation,
    getPerformanceMetrics,
    generateReport
};
