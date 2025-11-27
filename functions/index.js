process.env.FIREBASE_CONFIG_LOADED = "true";
// Cargar entorno
require("./config/environment");

// Inicializar Firebase
require("./config/firebase");

const functions = require("firebase-functions");

// Apps
const authApp = require("./src/apps/auth.app");
const usersApp = require("./src/apps/user.app");
const chatApp = require("./src/apps/message.app");
const jobsApp = require("./src/apps/jobs.app");
const reviewApp = require("./src/apps/review.app");

// Exportar como funciones independientes
exports.auth = functions.https.onRequest(authApp);
exports.users = functions.https.onRequest(usersApp);
exports.chat = functions.https.onRequest(chatApp);
exports.jobs = functions.https.onRequest(jobsApp);
exports.reviews = functions.https.onRequest(reviewApp);
