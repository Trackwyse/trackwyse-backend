/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

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

  USPSUserId: string;

  SaleorAccessToken: string;
  SaleorGraphQLURL: string;
  SaleorFreeLabelVariantId: string;
  SaleorFreeLabelChannelId: string;
  SaleorFreeShippingZoneId: string;

  AWSRegion: string;
  AWSAccessKeyId: string;
  AWSSecretAccessKey: string;

  AppleSharedSecret: string;
  AppleAppStoreEnv: ("sandbox" | "production")[];
  AppleSubscriptionRenewalLeeway: number;
  AppleMapsAuthToken: string;

  SaltFactor: number;
  AccessTokenPublicKey: string;
  AccessTokenPrivateKey: string;
  RefreshTokenPublicKey: string;
  RefreshTokenPrivateKey: string;
  AccessTokenExpiration: number;
  RefreshTokenExpiration: number;

  AuthWindowMs: number;
  AuthMaxRequests: number;
  APIWindowMs: number;
  APIMaxRequests: number;
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

  USPSUserId: process.env.USPS_USER_ID,

  SaleorAccessToken: process.env.SALEOR_ACCESS_TOKEN,
  SaleorGraphQLURL: process.env.SALEOR_GRAPHQL_URL,
  SaleorFreeLabelVariantId: process.env.SALEOR_FREE_LABEL_VARIANT_ID,
  SaleorFreeLabelChannelId: process.env.SALEOR_FREE_LABEL_CHANNEL_ID,
  SaleorFreeShippingZoneId: process.env.SALEOR_FREE_SHIPPING_ZONE_ID,

  AWSRegion: process.env.AWS_REGION || "us-east-1",
  AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  AWSSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  AppleSharedSecret: process.env.APPLE_SHARED_SECRET,
  AppleAppStoreEnv: [process.env.APPLE_APP_STORE_ENV as "sandbox" | "production"] || ["sandbox"],
  AppleSubscriptionRenewalLeeway: parseInt(process.env.APPLE_SUBSCRIPTION_RENEWAL_LEEWAY) || 86400,
  AppleMapsAuthToken: process.env.APPLE_MAPS_AUTH_TOKEN,

  SaltFactor: parseInt(process.env.SALT_FACTOR) || 10,
  AccessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC,
  AccessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE,
  RefreshTokenPublicKey: process.env.REFRESH_TOKEN_PUBLIC,
  RefreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE,
  AccessTokenExpiration: parseInt(process.env.ACCESS_TOKEN_EXPIRATION) || 3600,
  RefreshTokenExpiration: parseInt(process.env.REFRESH_TOKEN_EXPIRATION) || 86400,

  AuthWindowMs: parseInt(process.env.AUTH_WINDOW_MS) || 3600000,
  AuthMaxRequests: parseInt(process.env.AUTH_MAX_REQUESTS) || 10,
  APIWindowMs: parseInt(process.env.API_WINDOW_MS) || 60000,
  APIMaxRequests: parseInt(process.env.API_MAX_REQUESTS) || 150,
};

export default config;
