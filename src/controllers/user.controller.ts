import { User } from "../models/user.model";
import express from "express";
import MailService from "../lib/mail";

/*
  GET /api/v1/user
  Get the currently logged in user

  Required Fields: 
    - authorization header (handled by authenticateVerifiedAccessToken middleware)

  Returns:
    - error: string
    - message: string
    - user: User
*/
const getUser = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  // If the user has a subscription, but it's expired, set the subscription to inactive
  if (user.subscriptionActive && new Date(user.subscriptionReceipt.expirationDate) < new Date()) {
    user.subscriptionActive = false;

    await user.save();
  }

  const sanitizedUser = user.sanitize();

  return res.status(200).json({ error: false, message: "User retrieved", user: sanitizedUser });
};

/*
  PATCH /api/v1/user/update
  Update the currently logged in user

  Required Fields:
    - firstName: string
    - lastName: string
    - email: string

  Returns:
    - error: string
    - message: string
    - user: User
*/
const updateUser = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  const { firstName, lastName, email, notificationsEnabled, notificationPushToken } = req.body;

  try {
    if (lastName) user.lastName = lastName;
    if (firstName) user.firstName = firstName;

    if (
      notificationPushToken &&
      user.notificationPushTokens.indexOf(notificationPushToken) === -1
    ) {
      user.notificationPushTokens.push(notificationPushToken);
    }

    if (notificationsEnabled !== undefined) {
      user.notificationsEnabled = notificationsEnabled === "true";
    }

    // if email is changed, reverify the email
    if (email && email !== user.email) {
      user.verified = false;
      user.email = email;
      const verificationToken = await user.generateVerificationToken();

      await MailService.sendVerificationEmail(user.email, verificationToken);
    }

    await user.save();

    const sanitizedUser = user.sanitize();

    return res.status(200).json({ error: false, message: "User updated", user: sanitizedUser });
  } catch (err) {
    return res.status(500).json({ error: true, message: "An internal error occurred" });
  }
};

/*
  POST /api/v1/user/updatePassword
  Update the currently logged in user's password

  Required Fields:
    - currentPassword: string
    - newPassword: string

  Returns:
    - error: string
    - message: string
*/
const updatePassword = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return res.status(401).json({ error: true, message: "Incorrect current password" });
  }

  try {
    user.password = newPassword;

    await user.save();

    return res.status(200).json({ error: false, message: "Password updated" });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};

export default {
  getUser,
  updateUser,
  updatePassword,
};
