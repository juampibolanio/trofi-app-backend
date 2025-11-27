/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const DataValidationError = require("../errors/DataValidationError");

/**
 * Middleware genérico para validar datos de entrada usando Joi.
 * Ejecuta un esquema y, si hay errores, lanza un DataValidationError que
 * será capturado por el error handler global.
 *
 * @param {Object} schema - Esquema Joi para validar req.body.
 * @return {Function} Middleware express.
 */
module.exports = (schema) => (req, res, next) => {
  const {error} = schema.validate(req.body, {abortEarly: false});

  if (error) {
    // Unifica todos los mensajes de error en un único string legible
    const message = error.details.map((d) => d.message).join(", ");
    return next(new DataValidationError(message));
  }

  next();
};
