const BaseError = require("./BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

class ConflictError extends BaseError {
  constructor(message = "Conflicto en la solicitud") {
    super(message, httpStatusCodes.conflict);
  }
}

module.exports = ConflictError;
