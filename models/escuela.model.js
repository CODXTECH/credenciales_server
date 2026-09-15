const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Escuela = sequelize.define(
  "escuela",
  {
    id_escuela: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_escuela: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cct: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  { tableName: "escuela", timestamps: false }
);

module.exports = Escuela;