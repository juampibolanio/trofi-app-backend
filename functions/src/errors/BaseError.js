class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BaseError;
