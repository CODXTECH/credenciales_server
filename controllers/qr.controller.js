const CredencialQr = require("../models/credencial_qr.model.js");
const Alumno = require("../models/alumno.model.js");
const Personal = require("../models/personal.model.js");
const CicloEscolar = require("../models/ciclo.model.js");
const sequelize = require("../config/database.js");
const { Op } = require("sequelize");
require ("dotenv").config();

exports.generarSincronizarQrs = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_seccion, id_ciclo, tipo = "alumno" } = req.body;

    if (!id_ciclo) {
      await t.rollback();
      return res.status(400).json({
        exito: false,
        mensaje: "El id_ciclo es obligatorio.",
      });
    }

    // Leemos la URL base del archivo .env. Si no existe, usa localhost por defecto.
    const FRONTEND_URL = process.env.FRONTEND_URL || "http:www.credenciales.com/123";

    let creadosCount = 0;
    let actualizadosCount = 0;
    let totalProcesados = 0;

    if (tipo === "alumno") {
      if (!id_seccion) {
        await t.rollback();
        return res.status(400).json({
          exito: false,
          mensaje: "id_seccion es obligatorio para sincronizar alumnos.",
        });
      }

      const alumnos = await Alumno.findAll({
        where: { id_seccion },
        transaction: t,
      });

      totalProcesados = alumnos.length;

      for (const alumno of alumnos) {
        const urlVerificacion = `${FRONTEND_URL}/alumnos/${alumno.matricula}`;

        const [qrRecord, creado] = await CredencialQr.findOrCreate({
          where: {
            id_alumno: alumno.id_alumno,
            id_ciclo: id_ciclo,
          },
          defaults: {
            id_alumno: alumno.id_alumno,
            id_personal: null,
            id_ciclo: id_ciclo,
            codigo_url: urlVerificacion,
          },
          transaction: t,
        });

        if (creado) {
          creadosCount++;
        } else if (qrRecord.codigo_url !== urlVerificacion) {
          // Si el QR ya existía pero cambió la URL en el .env, la actualizamos
          qrRecord.codigo_url = urlVerificacion;
          await qrRecord.save({ transaction: t });
          actualizadosCount++;
        }
      }
    } else if (tipo === "personal") {
      const wherePersonal = id_seccion ? { id_seccion } : {};
      const personalList = await Personal.findAll({
        where: wherePersonal,
        transaction: t,
      });

      totalProcesados = personalList.length;

      for (const persona of personalList) {
        const urlVerificacion = `${FRONTEND_URL}/personal/${persona.matricula}`;

        const [qrRecord, creado] = await CredencialQr.findOrCreate({
          where: {
            id_personal: persona.id_personal,
            id_ciclo: id_ciclo,
          },
          defaults: {
            id_alumno: null,
            id_personal: persona.id_personal,
            id_ciclo: id_ciclo,
            codigo_url: urlVerificacion,
          },
          transaction: t,
        });

        if (creado) {
          creadosCount++;
        } else if (qrRecord.codigo_url !== urlVerificacion) {
          // Si el QR ya existía pero cambió la URL en el .env, la actualizamos
          qrRecord.codigo_url = urlVerificacion;
          await qrRecord.save({ transaction: t });
          actualizadosCount++;
        }
      }
    }

    await t.commit();

    return res.status(200).json({
      exito: true,
      mensaje: `Sincronización completada (${tipo}). Creados: ${creadosCount}, Actualizados: ${actualizadosCount}.`,
      totalProcesados,
      nuevosCreados: creadosCount,
      actualizados: actualizadosCount,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al sincronizar QRs:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno al sincronizar credenciales QR.",
    });
  }
};

exports.obtenerQrsParaGestion = async (req, res) => {
  try {
    const { id_seccion, id_ciclo, tipo } = req.query;

    const whereQr = {};
    if (id_ciclo && id_ciclo !== "null" && id_ciclo !== "0") {
      whereQr.id_ciclo = id_ciclo;
    }

    if (tipo === "alumno") {
      whereQr.id_alumno = { [Op.ne]: null };
    } else if (tipo === "personal") {
      whereQr.id_personal = { [Op.ne]: null };
    }

    const whereAlumno = {};
    const wherePersonal = {};

    if (id_seccion && id_seccion !== "null" && id_seccion !== "0") {
      whereAlumno.id_seccion = id_seccion;
      wherePersonal.id_seccion = id_seccion;
    }

    const listaQrs = await CredencialQr.findAll({
      where: whereQr,
      include: [
        {
          model: Alumno,
          as: "alumno", // <-- Coincide exactamente con la relación definida en tu modelo
          where: Object.keys(whereAlumno).length > 0 ? whereAlumno : undefined,
          required: false,
          attributes: [
            "id_alumno",
            "matricula",
            "nombre",
            "apellido",
            "grado_grupo",
            "foto_url",
            "id_seccion",
          ],
        },
        {
          model: Personal,
          as: "personal", // <-- Coincide exactamente con la relación definida en tu modelo
          where:
            Object.keys(wherePersonal).length > 0 ? wherePersonal : undefined,
          required: false,
          attributes: [
            "id_personal",
            "matricula",
            "nombre",
            "apellido",
            "cargo",
            "foto_url",
            "id_seccion",
          ],
        },
        {
          model: CicloEscolar,
          as: "ciclo_escolar",
          attributes: ["id_ciclo", "nombre"],
        },
      ],
    });

    // Ajustamos la verificación según el alias retornado ('alumno' o 'personal')
    const resultado = listaQrs.filter(
      (qr) =>
        qr.alumno != null ||
        qr.personal != null ||
        qr.Alumno != null ||
        qr.Personal != null,
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener listado de QRs:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error interno al recuperar las credenciales QR.",
    });
  }
};
