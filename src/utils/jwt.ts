import jwt from 'jsonwebtoken';
import config from '../config';

/*
  Create access token and return it
*/
const createAccessToken = (payload: SanitizedUser) => {
  const privateKey = Buffer.from(config.AccessTokenPrivateKey, 'base64').toString();

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: config.AccessTokenExpiration,
  });

  return token;
};

/*
  Create refresh token and return it
*/
const createRefreshToken = (payload: SanitizedUser) => {
  const privateKey = Buffer.from(config.RefreshTokenPrivateKey, 'base64').toString();

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: config.RefreshTokenExpiration,
  });

  return token;
};

/*
  Verify access token, if it's valid, return the payload, otherwise return null
*/
const verifyAccessToken = (token: string) => {
  const publicKey = Buffer.from(config.AccessTokenPublicKey, 'base64').toString();

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    }) as SanitizedUser;

    return payload;
  } catch (error) {
    return null;
  }
};

/*
  Verify refresh token, if it's valid, return the payload, otherwise return null 
 */
const verifyRefreshToken = (token: string) => {
  const publicKey = Buffer.from(config.RefreshTokenPublicKey, 'base64').toString();

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    }) as SanitizedUser;

    return payload;
  } catch (error) {
    return null;
  }
};

export default {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
