/*
 * Created on Mon Jan 23 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */
import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import storeController from "@/controllers/store.controller";

const storeRouter = express.Router();

// Storefront Product Management
storeRouter.get(
  "/products",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.getProducts
);
storeRouter.get(
  "/products/:id",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.getProductById
);

// Cart Management
storeRouter.get(
  "/checkout",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.getCheckout
);
storeRouter.post(
  "/checkout/add-product",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.addProductToCheckout
);
storeRouter.post(
  "/checkout/remove-product",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.removeProductFromCheckout
);
storeRouter.post(
  "/checkout/update-product",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.updateProductInCheckout
);
storeRouter.post(
  "/checkout/update-address",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.updateCheckoutAddress
);
storeRouter.post(
  "/checkout/update-delivery",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.updateCheckoutDelivery
);

// Payment Processing
storeRouter.post(
  "/payment/create",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.createPayment
);
storeRouter.post(
  "/payment/complete",
  authMiddleware.authenticateVerifiedAccessToken,
  storeController.completePayment
);

export default storeRouter;
