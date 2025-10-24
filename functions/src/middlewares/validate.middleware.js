const {DataValidationError} = require("../utils/httpStatusCodes");

module.exports = (schema) => (req, res, next) => {
  const {error} = schema.validate(req.body, {abortEarly: false});

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return next(new DataValidationError(message));
  }

  next();
};
