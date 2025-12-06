const admin = require("firebase-admin");
const path = require("path");
const {FIREBASE_DATABASE_URL, CREDENTIALS_FILE} = require("./environment");

try {
  // eslint-disable-next-line max-len
  if (!CREDENTIALS_FILE) throw new Error("CREDENTIALS_FILE no definido en environment.js");

  const serviceAccountPath = path.resolve(__dirname, `../${CREDENTIALS_FILE}`);
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: FIREBASE_DATABASE_URL,
  });

  console.log("Firebase inicializado correctamente.");
} catch (error) {
  console.error("Error al inicializar Firebase:", error.message);
}

module.exports = admin;
