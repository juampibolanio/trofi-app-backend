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

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AuthorizationError("Token requerido o formato inválido");
    }

    const idToken = parts[1];

    const decoded = await admin.auth().verifyIdToken(idToken);

    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return next(err);
    }

    return next(
        new AuthorizationError(`Token inválido: ${err.message}`),
    );
  }
};
