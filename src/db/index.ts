/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import mongoose from "mongoose";

import config from "@/config";
import { logger } from "@/lib/logger";

const connect = async () => {
  await mongoose.connect(config.DBUri, {
    dbName: config.DBName,
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error: ", err);
    process.exit();
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("MongoDB disconnected");
  });

  logger.info(`Connected to database in mode: ${config.NodeEnv}`);
};

const disconnect = () => {
  mongoose.connection.close();
};

export default {
  connect,
  disconnect,
};
