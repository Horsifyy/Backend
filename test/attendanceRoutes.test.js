const express = require("express");
const request = require("supertest");

const app = express();
app.use(express.json());

// Mock del controlador
const registerAttendance = (req, res) => {
  const { studentId, date, status } = req.body;
  if (!studentId || !date || !status) {
    return res.status(400).json({ error: "Faltan datos para registrar la asistencia" });
  }
  return res.status(201).json({ message: "Asistencia registrada", studentId, date, status });
};

const router = express.Router();
router.post("/register", registerAttendance);

app.use("/attendances", router);

// Tests
describe("Pruebas de rutas de asistencia", () => {
  test("POST /attendances/register registra la asistencia correctamente", async () => {
    const attendanceData = { studentId: "123", date: "2025-05-26", status: "presente" };
    const res = await request(app).post("/attendances/register").send(attendanceData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Asistencia registrada");
    expect(res.body).toMatchObject(attendanceData);
  });

  test("POST /attendances/register con datos incompletos retorna error 400", async () => {
    const incompleteData = { studentId: "123", status: "presente" }; // Falta fecha
    const res = await request(app).post("/attendances/register").send(incompleteData);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
