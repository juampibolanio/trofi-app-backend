const BaseError = require("./BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

class ResourceNotFoundError extends BaseError {
  constructor(message = "Recurso no encontrado") {
    super(message, httpStatusCodes.notFound);
  }
}

module.exports = ResourceNotFoundError;
