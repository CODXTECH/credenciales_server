const Escuela = require("../models/escuela.model");

// GET /api/escuela
exports.obtenerEscuela = async (req, res) => {
  try {
    const escuela = await Escuela.findByPk(1);

    if (!escuela) {
      return res.status(404).json({ mensaje: "Escuela no encontrada." });
    }

    res.json(escuela);
  } catch (error) {
    console.error("Error al obtener escuela:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/escuela
exports.actualizarEscuela = async (req, res) => {
  const { nombre_escuela, direccion, cct, telefono, logo_url } = req.body;

  try {
    const escuela = await Escuela.findByPk(1);

    if (!escuela) {
      return res.status(404).json({ mensaje: "Escuela no encontrada." });
    }

    await escuela.update({
      nombre_escuela: nombre_escuela || escuela.nombre_escuela,
      direccion: direccion ?? escuela.direccion,
      cct: cct ?? escuela.cct,
      telefono: telefono ?? escuela.telefono,
      logo_url: logo_url ?? escuela.logo_url,
    });

    res.json({
      exito: true,
      mensaje: "Datos actualizados correctamente.",
      escuela,
    });
  } catch (error) {
    console.error("Error al actualizar escuela:", error);
    res.status(500).json({ error: error.message });
  }
};