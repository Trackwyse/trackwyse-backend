import { Request, Response, NextFunction } from 'express';

import jwt from '../utils/jwt';
import { User } from '../models/user.model';

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

export default { authenticateRefreshToken };
