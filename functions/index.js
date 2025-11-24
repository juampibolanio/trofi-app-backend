process.env.FIREBASE_CONFIG_LOADED = "true";

// Cargar entorno
require("./config/environment");

// Inicializar Firebase
require("./config/firebase");

const functions = require("firebase-functions");

// Apps
const authApp = require("./src/apps/auth.app");
// const usersApp = require("./src/apps/users.app");
const jobsApp = require("./src/apps/jobs.app");

// Exportar como funciones independientes
exports.auth = functions.https.onRequest(authApp);
exports.jobs = functions.https.onRequest(jobsApp);
