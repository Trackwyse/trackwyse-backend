import appleReceiptVerify from "node-apple-receipt-verify";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import cors from "cors";

import { productRouter, labelRouter } from "./routes/product.route";
import subscriptionRouter from "./routes/subscription.route";
import { logger, morganLogger } from "./lib/logger";
import statusRouter from "./routes/status.route";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import config from "./config";
import db from "./db";

const app = express();

appleReceiptVerify.config({
  secret: config.AppleSharedSecret,
  environment: config.AppleAppStoreEnv,
  extended: true,
});

const startServer = async () => {
  app.use(cors());
  app.use(helmet());
  app.use(morganLogger);
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));

  await db.connect();

  app.use("/status", statusRouter);
  app.use("/auth/v1", authRouter);

  app.use("/api/v1", productRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/labels", labelRouter);
  app.use("/api/v1/subscription", subscriptionRouter);

  app.listen(config.Port, () => {
    logger.info(`Application started in mode: ${config.NodeEnv}`);
    logger.info(`Application listening on port: ${config.Port}`);
    logger.info(`Sending logs to: ${config.AppRoot}\\logs`);
    logger.info(`Connected to database: ${config.DBName}`);
  });
};

startServer();
