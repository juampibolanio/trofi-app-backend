/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const admin = require("../../config/firebase");
const AuthorizationError = require("../errors/AuthorizationError");

/**
 * Middleware de autenticación para proteger rutas privadas.
 * Valida el token Firebase enviado en el header Authorization.
 */
module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const parts = header.split(" ");

    // Validación básica del formato esperado
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AuthorizationError("Token requerido o formato inválido");
    }

    const idToken = parts[1];

    // Verifica el token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Información disponible: uid, email, role, etc.
    req.user = decoded;

    next();
  } catch (err) {
    // Error específico de autenticación
    if (err instanceof AuthorizationError) {
      return next(err);
    }

    // Error de Firebase (token expirado, mal formado, revocado, etc.)
    return next(
        new AuthorizationError(`Token inválido: ${err.message}`),
    );
  }
};
