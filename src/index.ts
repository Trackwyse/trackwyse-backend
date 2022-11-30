import express from 'express';
import cors from 'cors';

import { logger, morganLogger } from './utils/logger';
import config from './config';
import db from './db';

const app = express();

const start = async () => {
  app.use(cors());
  app.use(express.json());
  app.use(morganLogger);

  await db.connect();

  const authRouter = express.Router();
  const apiRouter = express.Router();

  app.use('/auth/v1', authRouter);
  app.use('/api/v1', apiRouter);

  app.listen(config.Port, () => {
    logger.info(`Application started in mode: ${config.NodeEnv}`);
    logger.info(`Application listening on port: ${config.Port}`);
    logger.info(`Sending logs to: ${config.AppRoot}/logs`);
  });
};

start();
