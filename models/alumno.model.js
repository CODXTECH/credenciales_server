const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const Seccion = require("./seccion_model.js");
const CicloEscolar = require("./ciclo.model.js");

const Alumno = sequelize.define(
  "alumno",
  {
    id_alumno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    matricula: {
      type: DataTypes.STRING,
      unique: true,
    },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    grado_grupo: DataTypes.STRING,
    foto_url: DataTypes.STRING,
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    genero: {
      type: DataTypes.ENUM("Masculino", "Femenino"),
      defaultValue: "Masculino",
    },
    estatus: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Baja"),
      defaultValue: "Activo",
    },
    id_seccion: {
      type: DataTypes.INTEGER,
      allowNull: true, // Se agrega explícitamente para permitir la lectura/escritura limpia en req.body
    },
  },
  { tableName: "alumnos", timestamps: true, underscored: true },
);

// Relación con Sección
Alumno.belongsTo(Seccion, { foreignKey: "id_seccion" });

module.exports = Alumno;
