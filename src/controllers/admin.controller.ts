import express from "express";

import { logger } from "@/lib/logger";
import User from "@/models/user.model";

/*
  POST /admin/set-premium
  Sets a user's premium status

  Request Body:
    - id: string
    - expiresIn: number (in seconds)
*/
const setPremium = async (req: express.Request, res: express.Response) => {
  let { id, expiresIn } = req.body;

  expiresIn = expiresIn || 300; // (5 minutes))

  if (!id) {
    return res.status(400).json({ error: true, message: "Missing id" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
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
    freeLabelsRedeemed: 0,
    freeLabelsRedeemable: true,
    freeLabelsNextRedeemable: new Date(new Date().getTime() + expiresIn * 1000),
    freeLabelsLastRedeemed: undefined,
    secureRecoveriesEnabled: false,
  };

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: true, message: "Error saving subscription" });
  }

  return res.status(200).json({ error: false, message: "Subscription saved" });
};

export default {
  setPremium,
};
