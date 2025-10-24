const {
  DataValidationError,
  AuthorizationError,
  DatabaseError,
  ResourceNotFoundError,
  httpStatusCodes,
} = require("../utils/httpStatusCodes");

module.exports = (err, req, res, next) => {
  console.error("Error:", err.name, "-", err.message);

  let status = httpStatusCodes.internalServerError;
  const message = err.message || "Error interno del servidor";

  if (err instanceof DataValidationError) status = httpStatusCodes.badRequest;
  if (err instanceof AuthorizationError) status = httpStatusCodes.unautorized;
  if (err instanceof ResourceNotFoundError) status = httpStatusCodes.notFound;
  if (err instanceof DatabaseError) status = httpStatusCodes.internalServerError;

  res.status(status).json({
    success: false,
    error: message,
  });
};
