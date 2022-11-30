import dotenv from 'dotenv';
import appRoot from 'app-root-path';

dotenv.config();

export interface Config {
  NodeEnv: string;
  LogLevel: string;
  AppRoot: string;

  Origin: string;
  Port: number;

  DBUri: string;
  DBName: string;

  SaltFactor: number;
  AccessTokenPublicKey: string;
  AccessTokenPrivateKey: string;
  RefreshTokenPublicKey: string;
  RefreshTokenPrivateKey: string;
  AccessTokenExpiration: number;
  RefreshTokenExpiration: number;
}

const config: Config = {
  NodeEnv: process.env.NODE_ENV || 'development',
  LogLevel: process.env.LOG_LEVEL || 'info',
  AppRoot: appRoot.path,

  Origin: process.env.ORIGIN || 'http://localhost:3000',
  Port: parseInt(process.env.PORT) || 3000,

  DBUri: process.env.DB_URI || 'mongodb://localhost:27017',
  DBName: process.env.DB_NAME || 'staging',

  SaltFactor: parseInt(process.env.SALT_FACTOR) || 10,
  AccessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC,
  AccessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE,
  RefreshTokenPublicKey: process.env.REFRESH_TOKEN_PUBLIC,
  RefreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE,
  AccessTokenExpiration: parseInt(process.env.ACCESS_TOKEN_EXPIRATION) || 3600,
  RefreshTokenExpiration: parseInt(process.env.REFRESH_TOKEN_EXPIRATION) || 86400,
};

export default config;
