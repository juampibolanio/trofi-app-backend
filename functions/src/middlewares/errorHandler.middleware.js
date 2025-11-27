/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const BaseError = require("../errors/BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

module.exports = (err, req, res, next) => {
  console.error("Ocurrió un error:", err.name, "-", err.message);

  // Errores personalizados (BaseError y derivados)
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      timestamp: err.timestamp,
    });
  }

  // Errores inesperados
  return res.status(httpStatusCodes.internalServerError).json({
    success: false,
    message: "Error interno del servidor",
    data: null,
    timestamp: new Date().toISOString(),
    details: err.message, // útil en desarrollo
  });
};
