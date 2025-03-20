const admin = require("firebase-admin");

// 🔹 Registrar una evaluación según el Método LUPE
const registerEvaluation = async (req, res) => {
    try {
        const { studentId, lupeLevel, balanceYEquilibrio, conduccion, equitacionCentrada, comments } = req.body;

        if (!studentId || !lupeLevel || !balanceYEquilibrio || !conduccion || !equitacionCentrada) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const evaluation = {
            studentId,
            lupeLevel,
            balanceYEquilibrio: {
                frecuenciaPractica: balanceYEquilibrio.frecuenciaPractica,
                controlPostura: balanceYEquilibrio.controlPostura,
                movimientosRitmo: balanceYEquilibrio.movimientosRitmo,
                feedbackEntrenador: balanceYEquilibrio.feedbackEntrenador
            },
            conduccion: {
                estadoEmocionalAntes: conduccion.estadoEmocionalAntes,
                estadoEmocionalDespues: conduccion.estadoEmocionalDespues,
                proyeccionEmocional: conduccion.proyeccionEmocional,
                ritmoRespiracion: conduccion.ritmoRespiracion
            },
            equitacionCentrada: {
                ejerciciosRealizados: equitacionCentrada.ejerciciosRealizados,
                balancePiernas: equitacionCentrada.balancePiernas,
                controlEquilibrio: equitacionCentrada.controlEquilibrio
            },
            comments,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await admin.firestore().collection("evaluations").add(evaluation);

        res.status(201).json({
            message: "Evaluación registrada con éxito",
            evaluation: { id: docRef.id, ...evaluation }
        });

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

module.exports = {
    registerEvaluation,
    getAllEvaluations,
    getEvaluationById,
    updateEvaluation,
    deleteEvaluation
};
