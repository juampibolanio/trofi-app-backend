process.env.FIREBASE_CONFIG_LOADED = "true";

// Cargar entorno
require("./config/environment");

// Inicializar Firebase y App
require("./config/firebase");
const functions = require("firebase-functions");
const app = require("./src/app");

// Exportar la función HTTP
exports.api = functions.https.onRequest(app);
