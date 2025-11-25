const BaseError = require("./BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

class DatabaseError extends BaseError {
  constructor(message = "Error de base de datos") {
    super(message, httpStatusCodes.internalServerError);
  }
}

module.exports = DatabaseError;
