import express from 'express';
import cors from 'cors';

import { logger, morganLogger } from './utils/logger';
import config from './config';
import db from './db';

const app = express();

const init = async () => {
  app.use(cors());
  app.use(express.json());
  app.use(morganLogger);

  await db.connect();
};

const start = async () => {
  await init();

  app.listen(config.Port, () => {
    logger.info(`Application started in mode: ${config.NodeEnv}`);
    logger.info(`Application listening on port: ${config.Port}`);
    logger.info(`Sending logs to: ${config.AppRoot}/logs`);
  });
};

start();
