import { Request, Response, NextFunction } from 'express';

import { User } from '../models/user.model';
import jwt from '../utils/jwt';

/*
  Only used for the /auth/vX/refresh route
  Verifies that the 'jwt' cookie is present and valid

  If the cookie is valid, the user is attached to the request
 */
const authenticateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies?.jwt) {
    const refreshToken = req.cookies.jwt;

    const payload = jwt.verifyRefreshToken(refreshToken);
    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  return res.status(401).json({ error: true, message: 'Unauthorized' });
};

/*
  Used for all routes except /auth/*
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is not verified, the request is rejected
*/
const authenticateVerifiedAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(' ')[1];

    const payload = jwt.verifyAccessToken(accessToken);
    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      if (!user.verified) {
        return res.status(401).json({ error: true, message: 'Unverified Account' });
      }

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  return res.status(401).json({ error: true, message: 'Unauthorized' });
};

/*
  Used for ONLY the /auth/vX/verify route
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is verified, the request is rejected

  This is used to prevent users from verifying their account multiple times

  This is also used to prevent users from verifying their account before they have
  created an account
*/
const authenticateUnverifiedAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(' ')[1];

    const payload = jwt.verifyAccessToken(accessToken);
    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      if (user.verified) {
        return res.status(401).json({ error: true, message: 'Already Verified' });
      }

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  return res.status(401).json({ error: true, message: 'Unauthorized' });
};

/*
  Used for ONLY the /auth/vX/me route
  Verifies that the 'authorization' header is present and valid

  If the header is valid, the user is attached to the request
  If the user is not verified, the request is rejected
*/
const authenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(' ')[1];

    const payload = jwt.verifyAccessToken(accessToken);
    const user = await User.findById(payload?.id);

    if (user) {
      const sanitizedUser = user.sanitize();

      req.user = sanitizedUser;
      return next();
    }

    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  return res.status(401).json({ error: true, message: 'Unauthorized' });
};

export default {
  authenticateRefreshToken,
  authenticateAccessToken,
  authenticateVerifiedAccessToken,
  authenticateUnverifiedAccessToken,
};
