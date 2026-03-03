// src/core/utils/logger.js
const { NODE_ENV, LOG_LEVEL } = require('../../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[LOG_LEVEL] !== undefined ? LEVELS[LOG_LEVEL] : LEVELS.info;
const isProduction = NODE_ENV === 'production';

const formatMessage = (level, message, meta) => {
  if (isProduction) {
    const entry = { level, message, timestamp: new Date().toISOString() };
    if (meta !== undefined) {
      if (meta instanceof Error) {
        entry.error = { message: meta.message, stack: meta.stack };
      } else {
        entry.meta = meta;
      }
    }
    return JSON.stringify(entry);
  }

  const timestamp = new Date().toISOString();
  const tag = `[${timestamp}] [${level.toUpperCase()}]`;
  if (meta instanceof Error) {
    return `${tag} ${message} — ${meta.message}`;
  }
  if (meta !== undefined) {
    return `${tag} ${message} ${typeof meta === 'string' ? meta : JSON.stringify(meta)}`;
  }
  return `${tag} ${message}`;
};

const logger = {
  error(message, meta) {
    if (currentLevel >= LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
  warn(message, meta) {
    if (currentLevel >= LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  info(message, meta) {
    if (currentLevel >= LEVELS.info) {
      console.log(formatMessage('info', message, meta));
    }
  },
  debug(message, meta) {
    if (currentLevel >= LEVELS.debug) {
      console.log(formatMessage('debug', message, meta));
    }
  }
};

module.exports = logger;
