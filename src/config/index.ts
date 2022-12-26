import dotenv from "dotenv";
import appRoot from "app-root-path";

dotenv.config();
export interface Config {
  NodeEnv: string;
  LogLevel: string;
  AppRoot: string;

  Origin: string;
  Port: number;

  DBUri: string;
  DBName: string;

  TimeToVerify: number;
  SenderEmail: string;

  ExpoAccessToken: string;

  AWSRegion: string;
  AWSAccessKeyId: string;
  AWSSecretAccessKey: string;

  SaltFactor: number;
  AccessTokenPublicKey: string;
  AccessTokenPrivateKey: string;
  RefreshTokenPublicKey: string;
  RefreshTokenPrivateKey: string;
  AccessTokenExpiration: number;
  RefreshTokenExpiration: number;
}

const config: Config = {
  NodeEnv: process.env.NODE_ENV || "development",
  LogLevel: process.env.LOG_LEVEL || "info",
  AppRoot: appRoot.path,

  Origin: process.env.ORIGIN || "http://localhost:3000",
  Port: parseInt(process.env.PORT) || 3000,

  DBUri: process.env.DB_URI || "mongodb://localhost:27017",
  DBName: process.env.DB_NAME || "staging",

  TimeToVerify: parseInt(process.env.TIME_TO_VERIFY) || 86400,
  SenderEmail: process.env.SENDER_EMAIL,

  ExpoAccessToken: process.env.EXPO_ACCESS_TOKEN,

  AWSRegion: process.env.AWS_REGION || "us-east-1",
  AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  AWSSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  SaltFactor: parseInt(process.env.SALT_FACTOR) || 10,
  AccessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC,
  AccessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE,
  RefreshTokenPublicKey: process.env.REFRESH_TOKEN_PUBLIC,
  RefreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE,
  AccessTokenExpiration: parseInt(process.env.ACCESS_TOKEN_EXPIRATION) || 3600,
  RefreshTokenExpiration: parseInt(process.env.REFRESH_TOKEN_EXPIRATION) || 86400,
};

export default config;
