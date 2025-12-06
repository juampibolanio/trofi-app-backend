/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const DataValidationError = require("../errors/DataValidationError");

/**
 * Middleware para validar datos de entrada usando Joi.
 * Ejecuta un esquema y, si hay errores, lanza un DataValidationError que
 * será capturado por el error handler global.
 */
module.exports = (schema) => (req, res, next) => {
  const {error} = schema.validate(req.body, {abortEarly: false});

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return next(new DataValidationError(message));
  }

  next();
};
