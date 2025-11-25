const BaseError = require("./BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

class ForbiddenError extends BaseError {
  constructor(message = "Acceso denegado") {
    super(message, httpStatusCodes.forbidden);
  }
}

module.exports = ForbiddenError;
