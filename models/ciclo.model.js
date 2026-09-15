const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");
const Escuela = require("./escuela.model.js");

const CicloEscolar = sequelize.define(
  "ciclo_escolar",
  {
    id_ciclo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_escuela: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estatus: {
      // Coincide con 'Activo' e 'Inactivo' usados en Controller y Flutter
      type: DataTypes.ENUM("activo", "inactivo"),
      defaultValue: "inactivo",
    },
  },
  {
    tableName: "ciclos_escolares",
    timestamps: false,
  },
);

CicloEscolar.belongsTo(Escuela, { foreignKey: "id_escuela", as: "escuela" });

module.exports = CicloEscolar;
