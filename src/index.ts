import express from 'express';
import cors from 'cors';
import db from './db';
import config from './config';

const app = express();

const init = async () => {
  app.use(cors());
  app.use(express.json());

  await db.connect();
};

const start = async () => {
  await init();

  app.listen(config.Port, () => {
    console.log(`Example app listening at ${config.Origin}`);
  });
};

start();
