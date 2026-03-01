// src/server.js
const app = require('./app');
const logger = require('./core/utils/logger');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
