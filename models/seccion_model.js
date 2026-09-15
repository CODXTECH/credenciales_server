const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Escuela = require("./escuela.model");

const Seccion = sequelize.define(
  "Seccion",
  {
    id_seccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_seccion: { type: DataTypes.STRING, allowNull: false },
    cct: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  {
    tableName: "secciones",
    timestamps: false,
  },
);

Seccion.belongsTo(Escuela, { foreignKey: "id_escuela" });
Escuela.hasMany(Seccion, { foreignKey: "id_escuela" });

module.exports = Seccion;
