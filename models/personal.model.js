const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const Seccion = require("./seccion_model.js");

const Personal = sequelize.define(
  "personal",
  {
    id_personal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    matricula: { type: DataTypes.STRING, unique: true },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    cargo: {
      type: DataTypes.ENUM(
        "Maestro",
        "Director",
        "Administrativo",
        "Intendencia",
        "Prefecto",
        "Cocina",
        "Enfermeria",
      ),
    },
    foto_url: DataTypes.STRING,
    genero: {
      type: DataTypes.ENUM("Masculino", "Femenino"),
      defaultValue: "Masculino",
    },
    estatus: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      defaultValue: "Activo",
    },
    fecha_nacimiento: DataTypes.DATEONLY,
  },
  { tableName: "personal", timestamps: true, underscored: true },
);

Personal.belongsTo(Seccion, { foreignKey: "id_seccion" });

module.exports = Personal;
