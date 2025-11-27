const BaseError = require("./BaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

class AuthorizationError extends BaseError {
  constructor(message = "No autorizado") {
    super(message, httpStatusCodes.unauthorized);
  }
}

module.exports = AuthorizationError;
