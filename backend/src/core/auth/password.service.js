// src/core/auth/password.service.js
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../../config/env');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
