import morgan from 'morgan';
import winston from 'winston';
import 'winston-daily-rotate-file';

import config from '../config';

const { combine, timestamp, printf, colorize, align } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
  align(),
  printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
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
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/error.log'`,
      level: 'error',
      format: fileFormat,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/exceptions.log`,
      format: fileFormat,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: `${config.AppRoot}/logs/rejections.log`,
      format: fileFormat,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
});

const morganLogger = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: Number.parseFloat(tokens['response-time'](req, res)),
    }),
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.http(data.trim());
      },
    },
  }
);

export { logger, morganLogger };
