/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import jwt from "@/utils/jwt";
import { logger } from "@/lib/logger";
import { User } from "@/models/user.model";

import MailService from "@/lib/mail";

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
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: true, message: "Invalid password" });
  }

  const sanitizedUser = user.sanitize();

  const accessToken = jwt.createAccessToken(sanitizedUser);
  const refreshToken = jwt.createRefreshToken(sanitizedUser);

  user.refreshToken = refreshToken;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error saving user" });
  }

  return res.status(200).json({
    error: false,
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

  return res.status(200).json({ error: false, message: "Token refreshed", accessToken });
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
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = new User({
    email,
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
    res.status(500).json({ error: true, message: "Error creating user" });
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

    return res.status(500).json({ error: true, message: "Error sending verification email" });
  }

  return res.status(201).json({
    error: false,
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
    return res.status(404).json({ error: true, message: "User not found" });
  }

  // Clear the push notification subscription
  user.notificationPushTokens = [];
  user.refreshToken = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error logging out user" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = await User.findOne({
    email,
  });

  if (user) {
    return res.status(200).json({ error: false, message: "Email in use", emailInUse: true });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  if (date.getTime() > user.verificationTokenExpires.getTime()) {
    return res.status(401).json({ error: true, message: "Verification token expired" });
  }

  if (user.verificationToken !== verificationToken) {
    return res.status(401).json({ error: true, message: "Invalid verification token" });
  }

  user.verified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error verifying user" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  // If the previous verification token has not expired, do not send a new one
  if (date.getTime() < user.verificationTokenExpires?.getTime() || user.verified) {
    return res
      .status(401)
      .json({ error: true, message: "User already has an active verification request" });
  }

  const verificationToken = await user.generateVerificationToken();

  try {
    await MailService.sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error sending verification email" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  try {
    const resetToken = await user.generatePasswordResetToken();

    await MailService.sendResetEmail(user.email, resetToken);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error sending password reset email" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  if (user.passwordResetToken !== resetToken) {
    return res.status(401).json({ error: true, message: "Invalid password reset token" });
  }

  const date = new Date();

  if (date.getTime() > user.passwordResetTokenExpires.getTime()) {
    return res.status(401).json({ error: true, message: "Password reset token expired" });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error resetting password" });
  }

  return res.status(200).json({
    error: false,
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
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  user.termsAccepted = true;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error accepting terms" });
  }

  return res.status(200).json({
    error: false,
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
