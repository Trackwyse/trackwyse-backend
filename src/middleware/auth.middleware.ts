import { Request, Response, NextFunction } from 'express';

import jwt from '../utils/jwt';
import { User } from '../models/user.model';

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
const authenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
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
}

export default { authenticateRefreshToken, authenticateAccessToken };
