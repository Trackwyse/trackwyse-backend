import mongoose from "mongoose";

import config from "../config";
import { logger } from "../lib/logger";

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
