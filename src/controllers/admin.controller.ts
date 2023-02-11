import express from "express";
import { v4 as uuidv4 } from "uuid";

import { logger } from "@/lib/logger";

import Errors from "@/lib/errors";
import User from "@/models/user.model";
import Label from "@/models/label.model";

/*
  POST /admin/set-premium
  Sets a user's premium status

  Request Body:
    - id: string
    - expiresIn: number (in seconds)
*/
const setPremium = async (req: express.Request, res: express.Response) => {
  let { id, expiresIn } = req.body;

  expiresIn = parseInt(expiresIn) || 300; // (5 minutes))

  if (!id) {
    return res.status(400).json(Errors.MissingFields("ADMIN_0"));
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json(Errors.UserNotFound("ADMIN_1"));
  }

  user.subscriptionActive = true;
  user.subscriptionDate = new Date();
  user.subscriptionReceipt = {
    quantity: 1,
    bundleId: "ADMIN_BYPASS",
    productId: "ADMIN_BYPASS",
    transactionId: "ADMIN_BYPASS",
    purchaseDate: new Date().getTime(),
    originalPurchaseDate: new Date().getTime(),
    expirationDate: new Date().getTime() + expiresIn * 1000,
    isTrialPeriod: false,
    environment: "ADMIN_BYPASS",
    applicationVersion: "ADMIN_BYPASS",
    originalApplicationVersion: "ADMIN_BYPASS",
  };

  user.subscriptionPerks = {
    freeLabelsRedeemable: true,
    freeLabelsNextRedeemable: new Date(new Date().getTime() + expiresIn * 1000),
    freeLabelsLastRedeemed: undefined,
  };

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("ADMIN_2"));
  }

  return res.status(200).json({ message: "Subscription saved" });
};

/*
  POST /admin/create-label
  Creates a single label in the database

  Response Body:
    - error: boolean
    - message: string
    - label: Label
*/
const createLabel = async (req: express.Request, res: express.Response) => {
  const label = new Label({
    uniqueID: uuidv4(),
  });

  try {
    await label.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("ADMIN_3"));
  }

  return res.status(200).json({ message: "Label saved", label });
};

/*
  POST /admin/create-label-sheet
  Create 6 labels in the database

  Response Body:
    - error: boolean
    - message: string
    - labels: Label[]
*/
const createLabelSheet = async (req: express.Request, res: express.Response) => {
  const labels = [];

  for (let i = 0; i < 12; i++) {
    const label = new Label({
      uniqueID: uuidv4(),
    });

    try {
      await label.save();
    } catch (err) {
      logger.error(err);
      return res.status(500).json(Errors.InternalServerError("ADMIN_4"));
    }

    labels.push(label);
  }

  return res.status(200).json({ message: "Labels saved", labels });
};

export default {
  setPremium,
  createLabel,
  createLabelSheet,
};
