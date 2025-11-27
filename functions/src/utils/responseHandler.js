/* eslint-disable valid-jsdoc */
// src/utils/responseHandler.js
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const {httpStatusCodes} = require("./httpStatusCodes");

/**
 * Envía una respuesta exitosa o informativa en un formato estándar.
 * Todas las respuestas del backend deben pasar por aquí.
 */
const sendResponse = (
    res,
    statusCode = httpStatusCodes.ok,
    data = null,
    message = null,
) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
};

/**
 * Envía una respuesta de error en formato estándar.
 */
const sendError = (
    res,
    statusCode = httpStatusCodes.internalServerError,
    message = "Error interno del servidor",
) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = {sendResponse, sendError};
