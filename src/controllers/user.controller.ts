/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import config from "@/config";
import { logger } from "@/lib/logger";

import USPS from "@/lib/usps";
import MailService from "@/lib/mail";
import User from "@/models/user.model";
import Label from "@/models/label.model";

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
  if (user.subscriptionActive) {
    // Make sure that the expiration date exists
    if (user.subscriptionReceipt && user.subscriptionReceipt?.expirationDate) {
      const expirationDate = new Date(user.subscriptionReceipt.expirationDate);
      // Factor in X minutes of leeway
      const currentDate = new Date(Date.now() - config.AppleSubscriptionRenewalLeeway);

      if (expirationDate < currentDate) {
        user.subscriptionActive = false;

        try {
          await user.save();
        } catch (err) {
          logger.error(err);
          return res.status(500).json({ error: true, message: "Error updating user" });
        }
      }
    }
  }

  const sanitizedUser = user.sanitize();

  return res.status(200).json({
    error: false,
    message: "User retrieved",
    user: sanitizedUser,
  });
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

  const {
    zip5,
    city,
    state,
    email,
    firstName,
    lastName,
    address1,
    address2,
    notificationsEnabled,
    notificationPushToken,
  } = req.body;

  if (lastName) user.lastName = lastName;
  if (firstName) user.firstName = firstName;

  // If the user is updating their notification push token, ensure that it's not already in the array
  if (notificationPushToken && !user.notificationPushTokens.includes(notificationPushToken)) {
    user.notificationPushTokens.push(notificationPushToken);
  }

  // If the user provides a notificationsEnabled value, update it
  if (notificationsEnabled !== undefined) {
    user.notificationsEnabled = notificationsEnabled === "true";
  }

  // if email is changed, reverify the email
  if (email && email !== user.email) {
    user.verified = false;
    user.email = email;
    const verificationToken = await user.generateVerificationToken();

    try {
      await MailService.sendVerificationEmail(user.email, verificationToken);
    } catch (err) {
      return res.status(500).json({ error: true, message: "Error sending verification email" });
    }
  }

  // If the user updates any part of their address, ensure that the address is valid
  if (zip5 || city || state || address1 || address2) {
    try {
      const address = await USPS.verify({
        Address1: address1 ?? user.address?.address1 ?? "",
        Address2: address2 ?? user.address?.address2 ?? "",
        City: city ?? user.address?.city ?? "",
        State: state ?? user.address?.state ?? "",
        Zip5: zip5 ?? user.address?.zip5 ?? "",
      });

      user.address = {
        isValid: true,
        address1: address.Address1,
        address2: address.Address2,
        city: address.City,
        state: address.State,
        zip5: address.Zip5,
      };
    } catch (err) {
      logger.error(err);
      return res.status(400).json({ error: true, message: "Invalid address" });
    }
  }

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error updating user" });
  }

  const sanitizedUser = user.sanitize();

  return res.status(200).json({ error: false, message: "User updated", user: sanitizedUser });
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

  user.password = newPassword;

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: err.message });
  }
  return res.status(200).json({ error: false, message: "Password updated" });
};

/*
  DELETE /api/v1/user/delete-account

  Required Fields:
    - password: string

  Returns:
    - error: string
    - message: string
*/
const deleteAccount = async (req: express.Request, res: express.Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: true, message: "Missing required fields" });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: true, message: "Unauthorized" });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: true, message: "Invalid password" });
  }

  // first, remove all of the user's labels
  user.labels.forEach(async (label) => {
    const labelToDelete = await Label.findById(label);

    if (labelToDelete) {
      labelToDelete.resetData();

      try {
        await labelToDelete.save();
      } catch (err) {
        logger.error(err);
      }
    }
  });

  // then, remove the user
  try {
    await user.remove();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error deleting account" });
  }

  return res.status(200).json({ error: false, message: "Account deleted" });
};

export default {
  getUser,
  updateUser,
  updatePassword,
  deleteAccount,
};
