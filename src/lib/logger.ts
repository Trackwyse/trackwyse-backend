/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import morgan from "morgan";
import winston from "winston";
import "winston-daily-rotate-file";

import config from "@/config";

const { combine, timestamp, printf, colorize, splat, align } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

const logger = winston.createLogger({
  level: config.LogLevel,
  format: combine(timestamp(), logFormat),
  exitOnError: false,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/errors.log`,
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      handleExceptions: true,
      json: false,
    }),
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/combined.log`,
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      handleExceptions: true,
      json: false,
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: combine(splat(), align(), colorize()),
  })
);

const morganLogger = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      contentLength: tokens.res(req, res, "content-length"),
      responseTime: Number.parseFloat(tokens["response-time"](req, res)),
    }),
  {
    stream: {
      write: (message) => {
        logger.http(message.trim());
      },
    },
  }
);

export { logger, morganLogger };
