/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import cors from "cors";
import helmet from "helmet";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import appleReceiptVerify from "node-apple-receipt-verify";

import db from "@/db";
import config from "@/config";
import authRouter from "@/routes/auth.route";
import userRouter from "@/routes/user.route";
import adminRouter from "@/routes/admin.route";
import statusRouter from "@/routes/status.route";
import { logger, morganLogger } from "@/lib/logger";
import locationRouter from "@/routes/location.route";
import rateLimit from "@/middleware/ratelimit.middleware";
import subscriptionRouter from "@/routes/subscription.route";
import { productRouter, labelRouter } from "@/routes/product.route";

const app = express();

appleReceiptVerify.config({
  secret: config.AppleSharedSecret,
  environment: config.AppleAppStoreEnv,
  extended: true,
  excludeOldTransactions: true,
});

const startServer = async () => {
  app.use(cors());
  app.use(helmet());
  app.use(morganLogger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(mongoSanitize());

  await db.connect();

  app.use("/status", statusRouter);
  app.use("/auth/v1", rateLimit.authLimiter, authRouter);

  app.use("/api/v1", rateLimit.apiLimiter, productRouter);
  app.use("/api/v1/user", rateLimit.apiLimiter, userRouter);
  app.use("/api/v1/admin", rateLimit.apiLimiter, adminRouter);
  app.use("/api/v1/labels", rateLimit.apiLimiter, labelRouter);
  app.use("/api/v1/location", rateLimit.apiLimiter, locationRouter);
  app.use("/api/v1/subscription", rateLimit.apiLimiter, subscriptionRouter);

  app.listen(config.Port, () => {
    logger.info(`Application started in mode: ${config.NodeEnv}`);
    logger.info(`Application listening on port: ${config.Port}`);
    logger.info(`Sending logs to: ${config.AppRoot}/logs`);
    logger.info(`Connected to database: ${config.DBName}`);
  });
};

startServer();
