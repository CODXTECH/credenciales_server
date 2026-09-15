const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const Alumno = require("../models/alumno.model.js");
const Personal = require("./personal.model.js");
const CicloEscolar = require("./ciclo.model.js");

const CredencialQR = sequelize.define(
  "credencial_qr",
  {
    id_qr: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_alumno: { type: DataTypes.INTEGER, allowNull: true },
    id_personal: { type: DataTypes.INTEGER, allowNull: true },
    id_ciclo: { type: DataTypes.INTEGER, allowNull: false },
    codigo_url: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "credencial_qr", timestamps: false, underscored: true },
);

// Relaciones pertenencia (belongsTo)
CredencialQR.belongsTo(Alumno, { foreignKey: "id_alumno" });
CredencialQR.belongsTo(Personal, { foreignKey: "id_personal" });
CredencialQR.belongsTo(CicloEscolar, { foreignKey: "id_ciclo" });

// Relaciones inversas (necesarias para el include desde Alumno/Personal)
Alumno.hasMany(CredencialQR, { foreignKey: "id_alumno" });
Personal.hasMany(CredencialQR, { foreignKey: "id_personal" });

module.exports = CredencialQR;
