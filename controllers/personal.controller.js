const sequelize = require("../config/database.js");
const CredencialQr = require("../models/credencial_qr.model.js");
const Personal = require("../models/personal.model");
const CicloEscolar = require("../models/ciclo.model.js");
const Seccion = require("../models/seccion_model.js");
const { Op } = require("sequelize");

// 1. Registrar nuevo Personal
exports.registrarPersonal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      nombre,
      apellido,
      cargo,
      foto_url,
      genero,
      fecha_nacimiento,
      id_seccion,
      matricula,
      estatus,
    } = req.body;

    // Validar si la matrícula ya existe dentro de la transacción
    if (matricula) {
      const existe = await Personal.findOne({
        where: { matricula },
        transaction: t,
      });
      if (existe) {
        await t.rollback();
        return res.status(400).json({
          exito: false,
          mensaje: "La matrícula ya se encuentra registrada",
        });
      }
    }

    // 1. Obtenemos el id del ciclo escolar activo
    const cicloActivo = await CicloEscolar.findOne({
      where: { estatus: "activo" },
      transaction: t,
    });

    // 2. Insertar personal
    const nuevoPersonal = await Personal.create(
      {
        nombre,
        apellido,
        cargo,
        matricula,
        fecha_nacimiento: fecha_nacimiento || null,
        foto_url: foto_url || "",
        genero: genero || "Masculino",
        estatus: estatus || "activo",
        id_seccion: id_seccion || null,
      },
      { transaction: t },
    );

    const urlVerificacion = `http://localhost:5173/personal/${matricula}`;

    // 3. Crear el registro en credencial_qr con el ciclo activo
    await CredencialQr.create(
      {
        id_alumno: null,
        id_personal: nuevoPersonal.id_personal,
        codigo_url: urlVerificacion,
        id_ciclo: cicloActivo ? cicloActivo.id_ciclo : null,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(201).json({
      exito: true,
      mensaje: "Personal y código QR registrados con éxito",
      matricula: nuevoPersonal.matricula,
    });
  } catch (error) {
    await t.rollback(); // <-- IMPRESCINDIBLE
    console.error("Error al registrar personal:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno al registrar personal",
      error: error.message,
    });
  }
};

// 2. Filtramos personal con cargo Maestro para la vista docentes
exports.obtenerDocentes = async (req, res) => {
  try {
    const docentes = await Personal.findAll({
      where: { cargo: "Maestro" },
      include: [
        {
          model: CredencialQr,
          attributes: ["id_qr", "codigo_url", "id_ciclo"],
        },
      ],
    });

    res.json(docentes);
  } catch (error) {
    console.error("Error al obtener Maestros:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Obtenemos personal general (todos los que NO sean Maestro)
exports.obtenerPersonalGeneral = async (req, res) => {
  try {
    const personal = await Personal.findAll({
      where: {
        cargo: {
          [Op.ne]: "Maestro",
        },
      },
      include: [
        {
          model: CredencialQr,
          attributes: ["id_qr", "codigo_url", "id_ciclo"],
        },
      ],
    });

    res.json(personal);
  } catch (error) {
    console.error("Error al obtener Personal general:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Obtener un registro de personal por su matrícula (Uso de findOne)
exports.obtenerPersonalMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;

    const registro = await Personal.findOne({
      where: { matricula },
    });

    if (!registro) {
      return res.status(404).json({
        exito: false,
        mensaje: "No se encontró personal con la matrícula especificada",
      });
    }

    return res.status(200).json({
      exito: true,
      datos: registro,
    });
  } catch (error) {
    console.error("Error al obtener datos por matrícula:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno del servidor",
    });
  }
};

// 4. Eliminar registro de personal por matrícula
exports.eliminarPersonal = async (req, res) => {
  try {
    const { matricula } = req.params;

    const registroEliminado = await Personal.destroy({
      where: { matricula },
    });

    if (registroEliminado > 0) {
      return res.status(200).json({
        exito: true,
        mensaje: "Registro de personal eliminado correctamente",
      });
    } else {
      return res.status(404).json({
        exito: false,
        mensaje: "No se encontró el registro para eliminar",
      });
    }
  } catch (error) {
    console.error("Error al eliminar registro de personal:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno del servidor",
    });
  }
};

// 5. Actualizar datos de un integrante del personal por matrícula
exports.actualizarPersonal = async (req, res) => {
  try {
    const { matricula } = req.params;

    const {
      nombre,
      apellido,
      cargo,
      foto_url,
      genero,
      fecha_nacimiento,
      estatus,
      id_seccion,
    } = req.body;

    const personal = await Personal.findOne({ where: { matricula } });

    if (!personal) {
      return res.status(404).json({
        exito: false,
        mensaje: "No se encontró un registro con esa matrícula",
      });
    }

    // Filtrar campos undefined para mantener datos existentes
    const datosAActualizar = Object.fromEntries(
      Object.entries({
        nombre,
        apellido,
        cargo,
        foto_url,
        genero,
        fecha_nacimiento,
        estatus,
        id_seccion,
      }).filter(([_, value]) => value !== undefined),
    );

    await personal.update(datosAActualizar);

    return res.status(200).json({
      exito: true,
      mensaje: "Registro de personal actualizado con éxito",
      datos: personal,
    });
  } catch (error) {
    console.error("Error al actualizar datos de personal:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno del servidor",
    });
  }
};

// Obtener perfil completo del personal
exports.obtenerPerfilPersonal = async (req, res) => {
  try {
    const { matricula } = req.params;

    // 1. Buscamos al personal con su Sección asociada
    const personal = await Personal.findOne({
      where: { matricula },
      include: [
        {
          model: Seccion,
          attributes: ["nombre_seccion"],
        },
      ],
    });

    if (!personal) {
      return res.status(404).json({ mensaje: "Personal no encontrado" });
    }

    // 2. Buscamos el ciclo escolar activo global
    const cicloActivo = await CicloEscolar.findOne({
      where: { estatus: "activo" },
    });

    // 3. Retornamos la respuesta mapeada
    res.json({
      id_personal: personal.id_personal,
      matricula: personal.matricula,
      nombre: personal.nombre,
      apellido: personal.apellido,
      cargo: personal.cargo,
      genero: personal.genero,
      foto_url: personal.foto_url,
      estatus: personal.estatus,
      seccion:
        personal.Seccion?.nombre_seccion ||
        personal.Seccion?.nombre ||
        "Sin asignar",
      ciclo_nombre: cicloActivo?.nombre || "Sin ciclo",
      vigencia: cicloActivo?.fecha_fin || null,
    });
  } catch (error) {
    console.error("Error en obtenerPerfilPersonal:", error);
    res.status(500).json({ error: error.message });
  }
};
