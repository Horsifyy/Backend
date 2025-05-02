const admin = require("firebase-admin");
const db = admin.firestore(); 

// Listado de ejercicios por nivel
const EXERCISES = {
  Amarillo: [
    "Montar a pelo (desarrollar equilibrio propio)",
    "Montar con silla",
    "Movimientos de los brazos (control del tronco y brazos)",
    "Giro sobre el caballo (sentido de orientación y equilibrio)",
    "Caminar en línea recta al paso",
    "Acostarse sobre el caballo",
    "Lanzamiento de aros en conos",
  ],
  Azul: [
    "Montar a pelo (desarrollar equilibrio propio)",
    "Montar con silla",
    "Transiciones paso-trote-paso",
    "Dar círculos (grandes y pequeños)",
    "Hacer serpentinas (al paso y al trote)",
    "Detenerse en un punto específico (control de la parada)",
    "Cambio de dirección para atrás (a la voz)",
  ],
  Rojo: [
    "Montar a pelo (equilibrio y conexión con el caballo)",
    "Montar con silla",
    "Transiciones complejas (trote – galope – parada)",
    "Círculos en diferentes tamaños",
    "Ejercicios combinados (serpentina + cambio de marcha)",
    "Detención exacta en línea recta (al galope o trote)",
  ],
};

const METRICS = {
  Amarillo: [
    "Estabilidad sobre el caballo",
    "Postura alineada",
    "Posición de las piernas",
    "Control del tronco y coordinación",
    "Uso adecuado de las manos y riendas",
  ],
  Azul: [
    "Precisión en las transiciones",
    "Trazado de figuras correctamente",
    "Respuesta del caballo a las órdenes",
    "Control y ritmo del movimiento",
    "Nivel de independencia en la conducción",
  ],
  Rojo: [
    "Capacidad para mantener un ritmo constante",
    "Ejercicios avanzados realizados correctamente",
    "Conexión y sincronización con el caballo",
    "Coordinación de movimientos",
    "Equilibrio constante",
  ],
};

const registerEvaluation = async (req, res) => {
  try {
    const { studentId, lupeLevel, exercises, metrics, comments, imageUrl } = req.body;

    // Validar datos
    if (!studentId || !lupeLevel) {
      return res.status(400).json({ error: "studentId y lupeLevel son obligatorios" });
    }

    const averageScore = calculateAverageScore(metrics || {});

    // Asegúrate de que no haya datos undefined
    let evaluation = {
      studentId,
      lupeLevel,
      exercises: exercises || [],  // Guardar los ejercicios seleccionados
      metrics: metrics || {},      // Guardar las calificaciones de métricas
      comments: comments || '',    // Si no hay comentarios, asignar cadena vacía
      averageScore: averageScore,
      imageUrl: imageUrl || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Procesamiento específico por nivel (mantenemos esto para compatibilidad)
    if (lupeLevel === "Amarillo") {
      evaluation.balanceYEquilibrio = metrics || {};
    }
    if (lupeLevel === "Azul") {
      evaluation.conduccion = metrics || {};
    }
    if (lupeLevel === "Rojo") {
      evaluation.equitacionCentrada = metrics || {};
    }

    // Guardar en Firestore
    const docRef = await admin.firestore().collection("evaluations").add(evaluation);
    res.status(201).json({ message: "Evaluación registrada", evaluation: { id: docRef.id, ...evaluation } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtener ejercicios por nivel
const getExercisesByLevel = (req, res) => {
  const { level } = req.params;
  const list = EXERCISES[level];
  if (!list) {
    return res.status(404).json({ error: `Nivel '${level}' no encontrado` });
  }
  res.json({ level, exercises: list });
};

// 🔹 Obtener métricas por nivel
const getMetricsByLevel = (req, res) => {
  const { level } = req.params;
  const list = METRICS[level];
  if (!list) {
    return res.status(404).json({ error: `Nivel '${level}' no encontrado` });
  }
  res.json({ level, metrics: list });
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

    // Preparar datos de actualización, incluyendo selectedExercises en cada objeto
    const updateData = {
      balanceYEquilibrio,
      conduccion,
      equitacionCentrada,
      comments,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

// 🔹 Obtener métricas del estudiante
const getStudentMetrics = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ error: "ID de estudiante requerido" });
    }
    
    const snapshot = await admin.firestore()
      .collection("evaluations")
      .where("studentId", "==", studentId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        averageScore: "0.00",
        metrics: [
          { name: "Control del caballo", value: "0" },
          { name: "Postura", value: "0" },
          { name: "Movimientos corporales", value: "0" },
          { name: "Control de la respiración", value: "0" },
        ],
      });
    }

    const latest = snapshot.docs[0].data();
    const metrics = calculateMetrics(latest, latest.lupeLevel);
    const averageScore = calculateAverageScore(metrics);

    res.status(200).json({ averageScore, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Funciones internas para cálculo de métricas
function calculateMetrics(evaluation, lupeLevel) {
  let metrics = [];
  switch (lupeLevel) {
    case "Amarillo":
      metrics = [
        { name: "Equilibrio estático", value: evaluation.balanceYEquilibrio.frecuenciaPractica },
        { name: "Equilibrio dinámico", value: evaluation.balanceYEquilibrio.frecuenciaPractica * 0.9 },
        { name: "Control postural", value: evaluation.balanceYEquilibrio.controlPostura * 0.8 },
        { name: "Estabilidad", value: evaluation.balanceYEquilibrio.movimientosRitmo * 0.7 },
      ];
      break;
    case "Azul":
      metrics = [
        { name: "Control del caballo", value: evaluation.conduccion.estadoEmocionalAntes },
        { name: "Precisión de movimientos", value: evaluation.conduccion.estadoEmocionalDespués * 0.9 },
        { name: "Comunicación con el caballo", value: evaluation.conduccion.proyeccionEmocional * 0.8 },
        { name: "Fluidez de movimientos", value: evaluation.conduccion.ritmoRespiracion * 0.7 },
      ];
      break;
    case "Rojo":
      metrics = [
        { name: "Postura", value: evaluation.equitacionCentrada.ejerciciosRealizados },
        { name: "Movimientos corporales", value: evaluation.equitacionCentrada.ejerciciosRealizados * 0.9 },
        { name: "Respiración", value: evaluation.equitacionCentrada.controlEquilibrio * 0.8 },
        { name: "Alineamiento", value: evaluation.equitacionCentrada.balancePiernas * 0.7 },
      ];
      break;
  }
  return metrics;
}

function calculateAverageScore(metrics) {
  const total = Object.values(metrics).reduce((sum, v) => sum + parseFloat(v), 0);
  return (total / Object.values(metrics).length).toFixed(2);
}

const getPreviousEvaluations = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { range, year, level } = req.query; // puede ser "week" o "month"

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    

    let startDate = null;
    const now = new Date();

     // Filtrar por rango: semana, mes o año
     if (range === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (range === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (range === 'year' && year) {
      startDate = new Date(`${year}-01-01`);
    }

    let query = db.collection('evaluations')
      .where('studentId', '==', studentId)
      .where('lupeLevel', '==', level) // Filtrar por nivel
      .orderBy('createdAt', 'desc'); // Ordenar por fecha

      // Si se seleccionó un rango de fechas, aplicar filtro de fecha
    if (startDate) {
      query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate));
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json([]); // No es error, solo lista vacía
    }

    const evaluations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString() || null
      };
    });

    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: 'Error fetching evaluations' });
  }
};

module.exports = {
  registerEvaluation,
  getAllEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getStudentMetrics,
  getPreviousEvaluations,
  getExercisesByLevel,
  getMetricsByLevel,
};
