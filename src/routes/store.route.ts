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

export default storeRouter;
