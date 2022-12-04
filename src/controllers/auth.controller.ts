import { User } from '../models/user.model';
import express from 'express';
import jwt from '../utils/jwt';
import config from '../config';

/*
  POST /auth/vX/login
  Logs in a user, sets a refresh token cookie, and returns an access token

  Required Fields:
    - email
    - password

  Returns:
    - error
    - message
    - OPTIONAL: accessToken
*/
const login = async (req: express.Request, res: express.Response) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({error: true, message: 'Missing required fields'});
  }

  const user = await User.findOne({email});

  if (!user) {
    return res.status(404).json({error: true, message: 'User not found'});
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({error: true, message: 'Invalid password'});
  }

  const sanitizedUser = user.sanitize();

  const accessToken = jwt.createAccessToken(sanitizedUser);
  const refreshToken = jwt.createRefreshToken(sanitizedUser);

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: config.RefreshTokenExpiration * 1000,
  });

  return res.status(200).json({error: false, message: 'User logged in', accessToken});
};

/*
  POST /auth/vX/refresh
  Refreshes the access token and returns a new one

  Required Fields:
    - jwt cookie (handled by authenticateRefreshToken middleware)

  Returns:
    - error
    - message
    - OPTIONAL: accessToken
*/
const refresh = (req: express.Request, res: express.Response) => {
  if (req.user) {
    const accessToken = jwt.createAccessToken(req.user);

    return res.status(200).json({ error: false, message: 'Token refreshed', accessToken });
  }

  return res.status(401).json({ error: true, message: 'Unauthorized' });
};

/*
  POST /auth/vX/register
  Registers a new user, sets a refresh token cookie, and returns an access token

  Required Fields:
    - email
    - password
    - firstName
    - lastName
  
  Returns:
    - error
    - message
    - OPTIONAL: accessToken
*/
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
