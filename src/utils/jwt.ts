/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import jwt from "jsonwebtoken";

import config from "@/config";
import { logger } from "@/lib/logger";

/*
  Create access token and return it
*/
const createAccessToken = (payload: SanitizedUser) => {
  const privateKey = Buffer.from(config.AccessTokenPrivateKey, "base64").toString();

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: config.AccessTokenExpiration,
  });

  return token;
};

/*
  Create refresh token and return it
*/
const createRefreshToken = (payload: SanitizedUser) => {
  const privateKey = Buffer.from(config.RefreshTokenPrivateKey, "base64").toString();

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: config.RefreshTokenExpiration,
  });

  return token;
};

/*
  Verify access token, if it's valid, return the payload, otherwise return null
*/
const verifyAccessToken = (token: string) => {
  const publicKey = Buffer.from(config.AccessTokenPublicKey, "base64").toString();

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as SanitizedUser;

    return payload;
  } catch (err) {
    logger.error(err);
    return err.name === "TokenExpiredError" ? "expired" : null;
  }
};

/*
  Verify refresh token, if it's valid, return the payload, otherwise return null 
 */
const verifyRefreshToken = (token: string) => {
  const publicKey = Buffer.from(config.RefreshTokenPublicKey, "base64").toString();

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as SanitizedUser;

    return payload;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export default {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
