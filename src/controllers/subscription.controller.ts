import express from "express";
import appleReceiptVerify from "node-apple-receipt-verify";
import { User } from "../models/user.model";

/*
  POST /subscription/create
  Create a new subscription

  Request body:
    - receipt: string

  Response body:
    - error: boolean
    - message: string
    - user: SanitizedUser
*/
const createSubscription = async (req: express.Request, res: express.Response) => {
  const { receipt } = req.body;

  if (!receipt) {
    return res.status(400).json({
      error: true,
      message: "Missing subscription receipt",
    });
  }

  try {
    const products = await appleReceiptVerify.validate({
      receipt,
    });

    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: true,
        message: "Invalid subscription receipt",
      });
    }

    let subscriptionReceipt = products[0];

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "User not found",
      });
    }

    user.subscriptionActive = true;
    user.subscriptionDate = new Date();
    user.subscriptionReceipt = subscriptionReceipt;

    await user.save();

    return res.json({
      error: false,
      message: "Subscription created",
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: "Invalid subscription receipt",
    });
  }
};

export default {
  createSubscription,
};
