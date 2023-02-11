/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";
import appleReceiptVerify from "node-apple-receipt-verify";

import config from "@/config";
import saleor from "@/lib/saleor";
import { logger } from "@/lib/logger";
import { CountryCode, AddressInput } from "@/graphql/generated/api";

import Errors from "@/lib/errors";
import User from "@/models/user.model";

/*
  GET /subscription
  Get subscription status

  Request body:
    - none

  Response body:
    - error: boolean
    - message: string
    - subscriptionActive: boolean
    - subscriptionDate: Date
    - subscriptionReceipt: SubscriptionReceipt
*/
const getSubscription = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("SUBSCRIPTION_0"));
  }

  return res.status(200).json({
    message: "Subscription status retrieved",
    subscriptionActive: user.subscriptionActive,
    subscriptionDate: user.subscriptionDate,
    subscriptionReceipt: user.subscriptionReceipt,
    subscriptionPerks: user.subscriptionPerks,
  });
};

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
    return res.status(400).json(Errors.MissingFields("SUBSCRIPTION_0"));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json(Errors.UserNotFound("SUBSCRIPTION_1"));
  }

  const products = await appleReceiptVerify.validate({
    receipt,
  });

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      error: {
        traceback: "SUBSCRIPTION_3",
        message: "INVALID_SUBSCRIPTION",
        humanMessage: "Invalid subscription",
      },
    });
  }

  let subscriptionReceipt = products[0];

  user.subscriptionActive = true;
  user.subscriptionReceipt = subscriptionReceipt;
  user.subscriptionDate = new Date(subscriptionReceipt.purchaseDate);

  user.subscriptionPerks = {
    freeLabelsRedeemable: true,
    freeLabelsNextRedeemable: new Date(subscriptionReceipt.expirationDate),
    freeLabelsLastRedeemed: user.subscriptionPerks.freeLabelsLastRedeemed || undefined,
  };

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("SUBSCRIPTION_4"));
  }

  const sanitizedUser = user.sanitize();

  return res.status(200).json({
    message: "Subscription created",
    user: sanitizedUser,
  });
};

/*
  POST /subscription/claim/free-labels
  Claim free labels

  Request body:
    - none

  Response body:
    - error: boolean
    - message: string
*/
const claimFreeLabels = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json(Errors.UserNotFound("SUBSCRIPTION_5"));
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
          return res.status(500).json(Errors.InternalServerError("SUBSCRIPTION_6"));
        }

        return res.status(400).json({
          error: {
            traceback: "SUBSCRIPTION_7",
            message: "SUBSCRIPTION_EXPIRED",
            humanMessage: "Your subscription has expired",
          },
        });
      }
    }
  }

  if (!user.subscriptionActive) {
    return res.status(400).json({
      error: {
        traceback: "SUBSCRIPTION_8",
        message: "SUBSCRIPTION_EXPIRED",
        humanMessage: "Your subscription has expired",
      },
    });
  }

  if (!user.subscriptionPerks?.freeLabelsRedeemable) {
    return res.status(400).json({
      error: {
        traceback: "SUBSCRIPTION_9",
        message: "FREE_LABELS_NOT_REDEEMABLE",
        humanMessage: "You cannot redeem free labels at this time",
      },
    });
  }

  if (!user.address?.isValid) {
    return res.status(400).json({
      error: {
        traceback: "SUBSCRIPTION_10",
        message: "INVALID_ADDRESS",
        humanMessage: "Please update your address before redeeming free labels",
      },
    });
  }

  const userAddress: AddressInput = {
    firstName: user.firstName,
    lastName: user.lastName,
    streetAddress1: user.address.address1,
    streetAddress2: user.address.address2,
    city: user.address.city,
    postalCode: user.address.zip5,
    country: CountryCode.Us, // TODO: Make this dynamic
    countryArea: user.address.state,
  };

  const draftOrder = await saleor.DraftOrderCreate({
    input: {
      billingAddress: userAddress,
      shippingAddress: userAddress,
      userEmail: user.email,
      customerNote: "Redeemed using Trackwyse plus",
      channelId: config.SaleorFreeLabelChannelId,
      shippingMethod: config.SaleorFreeShippingZoneId,
      lines: [
        {
          quantity: 1,
          variantId: config.SaleorFreeLabelVariantId,
        },
      ],
    },
  });

  if (!draftOrder.draftOrderCreate?.order) {
    return res.status(500).json(Errors.InternalServerError("SUBSCRIPTION_11"));
  }

  const completeOrder = await saleor.DraftOrderComplete({
    id: draftOrder.draftOrderCreate.order.id,
  });

  if (!completeOrder.draftOrderComplete?.order) {
    return res.status(500).json(Errors.InternalServerError("SUBSCRIPTION_12"));
  }

  user["subscriptionPerks"]["freeLabelsRedeemable"] = false;
  user["subscriptionPerks"]["freeLabelsLastRedeemed"] = new Date();

  try {
    await user.save();
  } catch (err) {
    logger.error(err);
    return res.status(500).json(Errors.InternalServerError("SUBSCRIPTION_13"));
  }

  return res.json({
    message: "Free labels claimed",
  });
};

export default {
  getSubscription,
  createSubscription,
  claimFreeLabels,
};
