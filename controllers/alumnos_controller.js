const sequelize = require("../config/database.js");
const CredencialQr = require("../models/credencial_qr.model");
const CicloEscolar = require("../models/ciclo.model");
const Alumno = require("../models/alumno.model.js");
const Seccion = require("../models/seccion_model.js");
const FRONTEND_URL = process.env.FRONTEND_URL;

// Función para registrar alumno y su credencial QR
exports.registrarAlumno = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      nombre,
      apellido,
      foto_url,
      genero,
      fecha_nacimiento,
      matricula,
      estatus,
      id_seccion,
      grado_grupo,
    } = req.body;

    // 1. Obtenemos el id del ciclo escolar activo
    const cicloActivo = await CicloEscolar.findOne({
      where: { estatus: "activo" },
    });

    // 2. Insertar alumno
    const nuevoAlumno = await Alumno.create(
      {
        nombre,
        apellido,
        grado_grupo,
        foto_url: foto_url || "",
        genero: genero || "Masculino",
        fecha_nacimiento,
        estatus: estatus || "Activo",
        id_seccion,
        matricula,
      },
      { transaction: t },
    );

    const urlVerificacion = `${FRONTEND_URL}/alumno${matricula}`;

    // 3. Crear el registro en credencial_qr con el ciclo activo
    await CredencialQr.create(
      {
        id_alumno: nuevoAlumno.id_alumno,
        id_personal: null,
        codigo_url: urlVerificacion,
        id_ciclo: cicloActivo ? cicloActivo.id_ciclo : null,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(201).json({
      exito: true,
      mensaje: "Alumno y código QR registrados con éxito",
      matricula: nuevoAlumno.matricula,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al registrar alumno:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno o datos incompletos.",
    });
  }
};

// Función para obtener alumnos filtrados por sección
exports.obtenerAlumnosPorSeccion = async (req, res) => {
  try {
    const { idSeccion } = req.params;

    const alumnos = await Alumno.findAll({
      where: { id_seccion: idSeccion },
      include: [
        {
          model: CredencialQr,
          attributes: ["id_qr", "codigo_url", "id_ciclo"],
        },
        { model: Seccion, attributes: ["id_seccion", "nombre_seccion", "cct"] },
      ],
    });

    return res.status(200).json(alumnos);
  } catch (error) {
    console.error("Error al obtener alumnos por sección:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno del servidor",
    });
  }
};

exports.obtenerAlumnoMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;

    const alumnos = await Alumno.findAll({
      where: { matricula: matricula },
      include: [
        { model: Seccion, attributes: ["id_seccion", "nombre_seccion", "cct"] },
      ],
    });

    return res.status(200).json(alumnos);
  } catch (error) {
    console.error("Error al obtener alumnos por matricula", error);
    return res.status(500).json({
      exito: false,
      mensaje: "error",
    });
  }
};

exports.eliminarRegistro = async (req, res) => {
  try {
    const { matricula } = req.params;

    const registroEliminado = await Alumno.destroy({
      where: {
        matricula: matricula,
      },
    });
    if (registroEliminado > 0) {
      return res
        .status(200)
        .json({ success: true, mensaje: "Alumno eliminado" });
    } else {
      return res
        .status(404)
        .json({ success: false, mensaje: "No se encontró el alumno" });
    }
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    return res
      .status(500)
      .json({ success: false, mensaje: "Error interno del servidor" });
  }
};

exports.actualizarAlumno = async (req, res) => {
  try {
    const { matricula } = req.params;

    console.log("req.body recibido en Node", req.body);

    const {
      nombre,
      apellido,
      foto_url,
      genero,
      grado_grupo,
      fecha_nacimiento,
      estatus,
      id_seccion,
    } = req.body;
    const alumno = await Alumno.findOne({ where: { matricula } });

    if (!alumno) {
      return res.status(404).json({
        exito: false,
        mensaje: "No se encontró un registro con esa matrícula",
      });
    }

    const datosAActualizar = Object.fromEntries(
      Object.entries({
        nombre,
        apellido,
        foto_url,
        genero,
        grado_grupo,
        fecha_nacimiento,
        estatus,
        id_seccion,
      }).filter(([_, value]) => value !== undefined),
    );

    // 3. Se aplica la actualización con el objeto limpio
    await alumno.update(datosAActualizar);

    return res.status(200).json({
      exito: true,
      mensaje: "Registro actualizado con éxito",
      datos: alumno,
    });
  } catch (error) {
    console.error("Error al actualizar registro:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno del servidor",
    });
  }
};

// Obtener perfil completo del alumno
exports.obtenerPerfilAlumno = async (req, res) => {
  try {
    const { matricula } = req.params;

    // 1. Buscamos al alumno con su Sección únicamente
    const alumno = await Alumno.findOne({
      where: { matricula },
      include: [{ model: Seccion, attributes: ["nombre_seccion"] }],
    });

    if (!alumno) {
      return res.status(404).json({ mensaje: "Alumno no encontrado" });
    }

    // 2. Buscamos el ciclo escolar activo global
    const cicloActivo = await CicloEscolar.findOne({
      where: { estatus: "activo" },
    });

    // 3. Retornamos la respuesta
    res.json({
      matricula: alumno.matricula,
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      grado_grupo: alumno.grado_grupo,
      foto_url: alumno.foto_url,
      estatus: alumno.estatus,
      nivel_educativo: alumno.Seccion?.nombre_seccion || "Sin asignar",
      ciclo_nombre: cicloActivo?.nombre || "Sin ciclo",
      vigencia: cicloActivo?.fecha_fin || null,
    });
  } catch (error) {
    console.error("Error en obtenerPerfilAlumno:", error);
    res.status(500).json({ error: error.message });
  }
};
