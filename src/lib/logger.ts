import morgan from "morgan";
import winston, { format } from "winston";
import "winston-daily-rotate-file";

import config from "../config";

const { combine, timestamp, printf, colorize, align } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
  align(),
  printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

const fileFormat = combine(
  format.errors({ stack: true }),
  timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
  align(),
  printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const logger = winston.createLogger({
  level: config.LogLevel,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/combined.log`,
      format: fileFormat,
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),
    new winston.transports.Console({
      level: "error",
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
        align(),
        printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/errors.log'`,
      level: "error",
      format: combine(printf((info) => info.message)),
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

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
