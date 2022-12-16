import { logger } from './utils/logger';
import config from './config';
import app from './app';
import db from './db';

const startServer = async () => {
  await db.connect();

  app.listen(config.Port, () => {
    logger.info(`Application started in mode: ${config.NodeEnv}`);
    logger.info(`Application listening on port: ${config.Port}`);
    logger.info(`Sending logs to: ${config.AppRoot}/logs`);
  });
};
startServer();
