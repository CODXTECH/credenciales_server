const express = require("express");
const router = express.Router();
const personalController = require("../controllers/personal.controller");
const alumnosController = require("../controllers/alumnos_controller");
const qrController = require("../controllers/qr.controller");
const ciclosController = require("../controllers/ciclo_controller");
const escuelaController = require("../controllers/escuela_controller");
const seccionController = require("../controllers/seccion.controller");

// RUTAS ALUMNOS
router.post("/alumno/registro", alumnosController.registrarAlumno);
router.get(
  "/alumno/seccion/:idSeccion",
  alumnosController.obtenerAlumnosPorSeccion,
);
router.delete(
  "/alumno/matricula/:matricula",
  alumnosController.eliminarRegistro,
);
router.get(
  "/alumno/matricula/:matricula",
  alumnosController.obtenerAlumnoMatricula,
);
router.put("/alumno/matricula/:matricula", alumnosController.actualizarAlumno);

// RUTAS PARA MAESTROS Y PERSONAL
router.post("/personal/registro", personalController.registrarPersonal);
router.put(
  "/personal/matricula/:matricula",
  personalController.actualizarPersonal,
);
router.delete(
  "/personal/matricula/:matricula",
  personalController.eliminarPersonal,
);
router.get("/personal/docentes", personalController.obtenerDocentes);

// Obtener lista de personal general (Sin maestros/docentes)
router.get("/personal/general", personalController.obtenerPersonalGeneral);
router.get(
  "/personal/matricula/:matricula",
  personalController.obtenerPersonalMatricula,
);
// RUTAS PARA GESTION DE QR
router.post("/sincronizar", qrController.generarSincronizarQrs);

router.get("/listar", qrController.obtenerQrsParaGestion);

//  RUTAS PARA PORTAL CON PERFIL DE ALUMNOS Y PERSONAL
router.get("/alumnos/:matricula", alumnosController.obtenerPerfilAlumno);

router.get("/personal/:matricula", personalController.obtenerPerfilPersonal);

// ==========================================
// RUTAS PARA CICLOS ESCOLARES
// ==========================================

// GET /api/ciclos -> Obtiene todos los ciclos (Activos e Inactivos)
router.get("/ciclos", ciclosController.obtenerTodosLosCiclos);
router.post("/ciclos/registrar", ciclosController.registrarCiclo);

// GET /api/ciclos/estatus -> Obtiene solo los ciclos activos (usado por Flutter)
router.get("/ciclos/estatus", (req, res, next) => {
  req.params.estatus = "Activo";
  ciclosController.obtenerCiclosPorEstatus(req, res, next);
});

// PUT /api/ciclos/:id/activar -> Activa un ciclo por ID
router.put("/ciclos/:id/activar", ciclosController.activarCiclo);
module.exports = router;

// Obtener datos del plantel
router.get("/escuela", escuelaController.obtenerEscuela);

// Actualizar datos del plantel
router.put("/escuela", escuelaController.actualizarEscuela);

router.put("/ciclos/:id", ciclosController.actualizarCiclo);
router.delete("/ciclos/:id", ciclosController.eliminarCiclo);

// RUTAS SECCIONES

router.get("/secciones/obtener", seccionController.obtenerSecciones);
router.post("/secciones/registrar", seccionController.registrarSeccion);
router.put("/secciones/:id", seccionController.actualizarSeccion);
router.delete("/secciones/:id", seccionController.eliminarSeccion);
