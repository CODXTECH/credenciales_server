const Seccion = require("../models/seccion_model");
const Escuela = require("../models/escuela.model");

// Obtener todas las secciones
exports.obtenerSecciones = async (req, res) => {
  try {
    const secciones = await Seccion.findAll({
      include: [
        {
          model: Escuela,
          attributes: ["id_escuela", "nombre_escuela"],
        },
      ],
      order: [["id_seccion", "ASC"]],
    });

    return res.json(secciones);
  } catch (error) {
    console.error("Error al obtener secciones:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};

// Registrar nueva sección
exports.registrarSeccion = async (req, res) => {
  const { nombre_seccion, id_escuela } = req.body;

  try {
    if (!nombre_seccion || !id_escuela) {
      return res.status(400).json({
        exito: false,
        mensaje: "El nombre de la sección y la escuela son obligatorios.",
      });
    }

    const nuevaSeccion = await Seccion.create({
      nombre_seccion,
      id_escuela,
    });

    return res.status(201).json({
      exito: true,
      mensaje: "Sección creada correctamente",
      seccion: nuevaSeccion,
    });
  } catch (error) {
    console.error("Error al registrar sección:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};

// Actualizar sección existente (Usa la misma estrategia que Escuela)
exports.actualizarSeccion = async (req, res) => {
  const { id } = req.params;
  const { nombre_seccion, id_escuela } = req.body;

  try {
    const seccion = await Seccion.findByPk(id);

    if (!seccion) {
      return res.status(404).json({
        exito: false,
        mensaje: "Sección no encontrada.",
      });
    }

    const datosAActualizar = {};

    if (nombre_seccion !== undefined)
      datosAActualizar.nombre_seccion = nombre_seccion;
    if (id_escuela !== undefined) datosAActualizar.id_escuela = id_escuela;

    await seccion.update(datosAActualizar);

    return res.json({
      exito: true,
      mensaje: "Sección actualizada correctamente.",
      seccion,
    });
  } catch (error) {
    console.error("Error al actualizar sección:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};

// Eliminar sección
exports.eliminarSeccion = async (req, res) => {
  const { id } = req.params;

  try {
    const seccion = await Seccion.findByPk(id);

    if (!seccion) {
      return res.status(404).json({
        exito: false,
        mensaje: "Sección no encontrada.",
      });
    }

    await seccion.destroy();

    return res.json({
      exito: true,
      mensaje: "Sección eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar sección:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};
