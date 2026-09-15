require("dotenv").config();
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM RECIBIDO");
});

process.on("SIGINT", () => {
  console.log("⚠️ SIGINT RECIBIDO");
});

process.on("exit", (code) => {
  console.log("⚠️ NODE EXIT, código:", code);
});

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ UNHANDLED REJECTION:", reason);
});

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const qrRoutes = require("./routes/qr.routes");
const morgan = require("morgan");
const {notFoundRouter, routeErrorHandling} = require("./error.js");

const app = express(); //Inicializamos

const FRONTEND_URL = process.env.FRONTEND_URL;
// usamos cors
app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
const PORT = process.env.PORT || 3005;
//Configuramos que el servidor pueda procesar datos en Json
app.use(express.json());

app.use(morgan('combined'));

// Enlace del módulo QR
app.use("/api/qr", qrRoutes);
app.use("/api", qrRoutes); // Todas las rutas iniciaran en api despues de localhost y puerto etc

app.use(notFoundRouter);
app.use(routeErrorHandling);

sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado con exito :)");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor activo en puerto: ${PORT}`);
      console.log(`url frontend: ${FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    console.error("Error muy malo", err);
    process.exit(1);
  });
