// src/core/utils/response.js
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

module.exports = { successResponse, errorHandler };