import { User } from '../models/user.model';
import express from 'express';
import jwt from '../utils/jwt';
import config from '../config';

const login = (req: express.Request, res: express.Response) => {
  return res.status(200).json({ message: 'Login' });
};

const refresh = (req: express.Request, res: express.Response) => {
  if (req.user) {
    const accessToken = jwt.createAccessToken(req.user);

    return res.status(200).json({ error: false, message: 'Token refreshed', accessToken });
  }

  return res.status(401).json({ error: true, message: 'Unauthorized' });
};

const register = async (req: express.Request, res: express.Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: true, message: 'Missing required fields' });
  }

  const user = new User({
    email,
    password,
    firstName,
    lastName,
  });

  try {
    const userDocument = await user.save();
    const sanitizedUser = userDocument.sanitize();

    const accessToken = jwt.createAccessToken(sanitizedUser);
    const refreshToken = jwt.createRefreshToken(sanitizedUser);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: config.RefreshTokenExpiration * 1000,
    });

    return res.status(201).json({ error: false, message: 'User created', accessToken });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export default {
  login,
  refresh,
  register,
};
