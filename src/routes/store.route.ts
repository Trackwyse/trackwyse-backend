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

export default storeRouter;
