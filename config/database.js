const { Sequelize } = require("sequelize");
require("dotenv").config();

const user = process.env.USER;
const pass = process.env.PASS;
const host = process.env.HOST;
const db = process.env.DB;

//Configuramos la conexion a la db
const sequelize = new Sequelize(db, user, pass, {
  host: host,
  dialect: "mysql",
  pool: {
    max: 20, // Aumenta el máximo de conexiones simultáneas (por defecto es 5)
    min: 0, // Mínimo de conexiones en el pool
    acquire: 60000, // Tiempo máximo (ms) que Sequelize intentará obtener una conexión antes de lanzar timeout (60s)
    idle: 10000, // Tiempo máximo (ms) que una conexión puede estar inactiva antes de ser liberada
  },
});

module.exports = sequelize;
