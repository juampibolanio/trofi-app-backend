// src/utils/responseHandler.js
const {httpStatusCodes} = require("./httpStatusCodes");

const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    data,
  });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = {sendResponse, sendError};
