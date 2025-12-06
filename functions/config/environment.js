const path = require("path");
const dotenv = require("dotenv");

// Cargar el archivo .env desde la raíz del proyecto
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({path: envPath});

console.log("Variables de entorno cargadas desde:", envPath);

// Exportar variables en uso
module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.APP_PORT || 5001,
  FIREBASE_DATABASE_URL: process.env.RTDB_FIREBASE_DATABASE_URL,
  CREDENTIALS_FILE: process.env.CREDENTIALS_FILE_NAME,
  FIREBASE_API_KEY: process.env.API_KEY,
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    SECURE: process.env.SMTP_SECURE === "true",
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,
    FROM: process.env.SMTP_FROM,
  },
};
