/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import jwt from "@/utils/jwt";
import Errors from "@/lib/errors";
import MailService from "@/lib/mail";
import { logger } from "@/lib/logger";
import User from "@/models/user.model";

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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(Errors.MissingFields("AUTH_0"));
  }

  // convert email to lowercase to prevent duplicate emails
  const emailLower = email.toLowerCase();

  const user = await User.findOne({ email: { $eq: emailLower } });

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_1", "email"));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: {
        field: "password",
        traceback: "AUTH_2",
        message: "INVALID_PASSWORD",
        humanMessage: "The password you entered is incorrect.",
      },
    });
  }

  const sanitizedUser = user.sanitize();

  const accessToken = jwt.createAccessToken(sanitizedUser);
  const refreshToken = jwt.createRefreshToken(sanitizedUser);

  user.refreshToken = refreshToken;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_3"));
  }

  return res.status(200).json({
    message: "User logged in",
    accessToken,
    refreshToken,
  });
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
  const accessToken = jwt.createAccessToken(req.user);

  return res.status(200).json({ message: "Token refreshed", accessToken });
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
    return res.status(400).json(Errors.MissingFields("AUTH_4"));
  }

  // convert email to lowercase to prevent duplicate emails
  const emailLower = email.toLowerCase();

  const user = new User({
    email: emailLower,
    password,
    firstName,
    lastName,
  });

  let userDocument;
  let verificationToken;

  try {
    userDocument = await user.save();
    verificationToken = await userDocument.generateVerificationToken();
  } catch (err) {
    logger.error(err);
    res.status(500).json(Errors.InternalServerError("AUTH_5"));
  }

  const sanitizedUser = userDocument.sanitize();

  const accessToken = jwt.createAccessToken(sanitizedUser);
  const refreshToken = jwt.createRefreshToken(sanitizedUser);

  // Update the user's refresh token
  userDocument.refreshToken = refreshToken;

  try {
    await userDocument.save();
    await MailService.sendVerificationEmail(sanitizedUser.email, verificationToken);
  } catch (err) {
    logger.error(err);

    // Delete the user if the verification email fails to send
    // This is to prevent users from not being able to verify their email
    await userDocument.deleteOne();

    return res.status(500).json(Errors.InternalServerError("AUTH_6"));
  }

  return res.status(200).json({
    message: "User created",
    accessToken,
    refreshToken,
  });
};

/*
  POST /auth/vX/logout
  Logs out a user, clears the refresh token cookie

  Required Fields:
    - authorization header (handled by authenticateAccessToken middleware)

  Returns:
    - error
    - message
*/
const logout = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_7"));
  }

  // Clear the push notification subscription
  user.notificationPushTokens = [];
  user.refreshToken = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_8"));
  }

  return res.status(200).json({
    message: "User logged out",
  });
};

/*
  POST /auth/vX/checkEmail
  Checks if an email is already in use

  Required Fields:
    - email

  Returns:
    - error
    - message
    - OPTIONAL: emailInUse

  Note: This endpoint is not authenticated
*/
const checkEmail = async (req: express.Request, res: express.Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(Errors.MissingFields("AUTH_9"));
  }

  const user = await User.findOne({
    email: { $eq: email },
  });

  if (user) {
    return res.status(200).json({ message: "Email in use", emailInUse: true });
  }

  return res.status(200).json({
    message: "Email not in use",
    emailInUse: false,
  });
};

/*
  POST /auth/vX/verify
  Verifies a user's email

  Required Fields:
    - authorization header (handled by authenticateAccessToken middleware)

  Returns:
    - error
    - message
 */
const verify = async (req: express.Request, res: express.Response) => {
  const date = new Date();
  const { verificationToken } = req.body;

  if (!verificationToken) {
    return res.status(400).json(Errors.MissingFields("AUTH_10"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_11"));
  }

  if (date.getTime() > user.verificationTokenExpires.getTime()) {
    return res.status(401).json({
      error: {
        field: "verificationToken",
        traceback: "AUTH_12",
        message: "VERIFICATION_TOKEN_EXPIRED",
        humanMessage: "Verification token expired",
      },
    });
  }

  if (user.verificationToken !== verificationToken) {
    return res.status(401).json({
      error: {
        field: "verificationToken",
        traceback: "AUTH_13",
        message: "VERIFICATION_TOKEN_INVALID",
        humanMessage: "Invalid verification token",
      },
    });
  }

  user.verified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_14"));
  }

  return res.status(200).json({
    message: "User verified",
  });
};

/*
  POST /auth/vX/reverify
  Resends a verification email to a user

  Required Fields:
    - authorization header (handled by authenticateAccessToken middleware)

  Returns:
    - error
    - message
*/
const reverify = async (req: express.Request, res: express.Response) => {
  const date = new Date();
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_15"));
  }

  // If the previous verification token has not expired, do not send a new one
  if (date.getTime() < user.verificationTokenExpires?.getTime() || user.verified) {
    return res.status(401).json({
      error: {
        field: "verificationToken",
        traceback: "AUTH_16",
        message: "VERIFICATION_TOKEN_NOT_EXPIRED",
        humanMessage: "You already have an active verification token",
      },
    });
  }

  const verificationToken = await user.generateVerificationToken();

  try {
    await MailService.sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_17"));
  }

  return res.status(200).json({
    message: "Verification email sent",
  });
};

/*
  POST /auth/vX/forgot
  Sends a password reset email to a user

  Required Fields:
    - email

  Returns:
    - error
    - message
*/
const forgot = async (req: express.Request, res: express.Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(Errors.MissingFields("AUTH_18"));
  }

  const user = await User.findOne({
    email: { $eq: email },
  });

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_19", "email"));
  }

  try {
    const resetToken = await user.generatePasswordResetToken();

    await MailService.sendResetEmail(user.email, resetToken);
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_20"));
  }

  return res.status(200).json({
    message: "Password reset email sent",
  });
};

/*
  POST /auth/vX/reset
  Resets a user's password

  Required Fields:
    - email
    - password
    - resetToken

  Returns:
    - error
    - message
    - accessToken
*/
const reset = async (req: express.Request, res: express.Response) => {
  const { email, password, resetToken } = req.body;

  if (!email || !password || !resetToken) {
    return res.status(400).json(Errors.MissingFields("AUTH_21"));
  }

  const user = await User.findOne({
    email: { $eq: email },
  });

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_22"));
  }

  if (user.passwordResetToken !== resetToken) {
    return res.status(401).json({
      error: {
        field: "resetToken",
        traceback: "AUTH_23",
        message: "RESET_TOKEN_INVALID",
        humanMessage: "Invalid reset token",
      },
    });
  }

  const date = new Date();

  if (date.getTime() > user.passwordResetTokenExpires.getTime()) {
    return res.status(401).json({
      error: {
        field: "resetToken",
        traceback: "AUTH_24",
        message: "RESET_TOKEN_EXPIRED",
        humanMessage: "Reset token has expired",
      },
    });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_25"));
  }

  return res.status(200).json({
    message: "Password reset",
  });
};

/*
  POST /auth/v1/terms
  Means that the user has accepted the terms of service

  Required Fields:
    - authorization header (handled by authenticateAccessToken middleware)

  Returns:
    - error
    - message
*/
const acceptTerms = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("AUTH_26"));
  }

  user.termsAccepted = true;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("AUTH_27"));
  }

  return res.status(200).json({
    message: "Terms accepted",
  });
};

export default {
  login,
  reset,
  logout,
  verify,
  forgot,
  refresh,
  register,
  reverify,
  checkEmail,
  acceptTerms,
};
