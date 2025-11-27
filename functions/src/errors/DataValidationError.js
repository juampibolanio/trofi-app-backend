const BaseError = require("./BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

class DataValidationError extends BaseError {
  constructor(message = "Datos inválidos") {
    super(message, httpStatusCodes.badRequest);
  }
}

module.exports = DataValidationError;
