/*
 * Created on Mon Jan 16 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import transactionsController from "@/controllers/transactions.controller";

const transactionsRouter = express.Router();

transactionsRouter.get(
  "/",
  authMiddleware.authenticateVerifiedAccessToken,
  transactionsController.getTransactions
);

export default transactionsRouter;
