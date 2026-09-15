const CicloEscolar = require("../models/ciclo.model");
const sequelize = require("../config/database");

// Registrar un nuevo ciclo escolar
exports.registrarCiclo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, fecha_inicio, fecha_fin, id_escuela, estatus } = req.body;

    // Validar campos requeridos por la base de datos (NOT NULL)
    if (!nombre || !fecha_inicio || !fecha_fin || !id_escuela) {
      await t.rollback();
      return res.status(400).json({
        exito: false,
        mensaje:
          "Los campos nombre, fecha_inicio, fecha_fin e id_escuela son obligatorios.",
      });
    }

    const nuevoCiclo = await CicloEscolar.create(
      {
        nombre,
        fecha_inicio,
        fecha_fin,
        id_escuela,
        estatus: estatus ? estatus.toLowerCase() : "activo", // Forzar minúsculas
      },
      { transaction: t },
    );

    await t.commit();
    return res.status(201).json({
      exito: true,
      mensaje: "Ciclo escolar creado correctamente",
      ciclo: nuevoCiclo,
    });
  } catch (error) {
    await t.rollback(); // Rollback indispensable ante cualquier error
    console.error("Error al registrar ciclo escolar:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};

// Cambiar estatus de un ciclo a 'activo' (y desactivar los demás de la misma escuela)
exports.activarCiclo = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    // 1. Buscar el ciclo a activar para obtener su id_escuela
    const cicloAActivar = await CicloEscolar.findByPk(id, { transaction });

    if (!cicloAActivar) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ exito: false, mensaje: "Ciclo escolar no encontrado." });
    }

    // 2. Desactivar únicamente los ciclos activos de la MISMA escuela
    await CicloEscolar.update(
      { estatus: "inactivo" }, // Minúsculas acorde al ENUM
      {
        where: {
          id_escuela: cicloAActivar.id_escuela,
          estatus: "activo",
        },
        transaction,
      },
    );

    // 3. Activar el ciclo seleccionado
    cicloAActivar.estatus = "activo";
    await cicloAActivar.save({ transaction });

    await transaction.commit();
    return res.json({
      exito: true,
      mensaje: "Ciclo escolar activado correctamente.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al activar el ciclo escolar:", error);
    return res.status(500).json({ exito: false, error: error.message });
  }
};

// Obtiene TODOS los ciclos escolares (Activos e Inactivos)
exports.obtenerTodosLosCiclos = async (req, res) => {
  try {
    const ciclos = await CicloEscolar.findAll({
      order: [["fecha_inicio", "DESC"]],
    });

    return res.json(ciclos);
  } catch (error) {
    console.error("Error al consultar ciclos:", error);
    return res.status(500).json({ exito: false, error: error.message });
  }
};

// Obtiene únicamente los ciclos filtrados por estatus (Ej: /api/ciclos/estatus/activo)
exports.obtenerCiclosPorEstatus = async (req, res) => {
  const { estatus } = req.params;

  try {
    const ciclos = await CicloEscolar.findAll({
      where: { estatus: estatus.toLowerCase() }, // Se evalúa en minúsculas
      order: [["fecha_inicio", "DESC"]],
    });

    return res.json(ciclos);
  } catch (error) {
    console.error("Error al consultar ciclo por estatus:", error);
    return res.status(500).json({ exito: false, error: error.message });
  }
};

// PUT /api/ciclos-escolares/:id
exports.actualizarCiclo = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin, id_escuela, estatus } = req.body;

  try {
    const ciclo = await CicloEscolar.findByPk(id);

    if (!ciclo) {
      return res.status(404).json({
        exito: false,
        mensaje: "Ciclo escolar no encontrado.",
      });
    }

    // Armamos los datos únicamente con lo que venga enviado
    const datosAActualizar = {};

    if (nombre !== undefined) datosAActualizar.nombre = nombre;
    if (fecha_inicio !== undefined) datosAActualizar.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined) datosAActualizar.fecha_fin = fecha_fin;
    if (id_escuela !== undefined) datosAActualizar.id_escuela = id_escuela;
    if (estatus !== undefined) datosAActualizar.estatus = estatus.toLowerCase();

    // Actualizamos el registro encontrado
    await ciclo.update(datosAActualizar);

    return res.json({
      exito: true,
      mensaje: "Ciclo escolar actualizado correctamente.",
      ciclo,
    });
  } catch (error) {
    console.error("Error al actualizar ciclo escolar:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};

// Eliminar ciclo escolar (Solo si no está activo)
exports.eliminarCiclo = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const ciclo = await CicloEscolar.findByPk(id, { transaction: t });

    if (!ciclo) {
      await t.rollback();
      return res.status(404).json({
        exito: false,
        mensaje: "Ciclo escolar no encontrado.",
      });
    }

    // Regla de negocio: No permitir eliminar si el ciclo está activo
    if (ciclo.estatus.toLowerCase() === "activo") {
      await t.rollback();
      return res.status(400).json({
        exito: false,
        mensaje: "No se puede eliminar un ciclo escolar activo.",
      });
    }

    await ciclo.destroy({ transaction: t });
    await t.commit();

    return res.json({
      exito: true,
      mensaje: "Ciclo escolar eliminado correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar ciclo escolar:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno en el servidor",
      error: error.message,
    });
  }
};
