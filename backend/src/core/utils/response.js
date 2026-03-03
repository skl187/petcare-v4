// src/core/utils/response.js
const logger = require('./logger');

const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const errorResponse = (message, statusCode = 400) => {
  return {
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  };
};

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(errorResponse(message, statusCode));
};

module.exports = { successResponse, errorResponse, errorHandler };
