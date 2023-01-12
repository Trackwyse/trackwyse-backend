/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import authController from "@/controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/reset", authController.reset);
authRouter.post("/forgot", authController.forgot);
authRouter.post("/register", authController.register);
authRouter.post("/check-email", authController.checkEmail);

authRouter.post(
  "/refresh",

  authMiddleware.authenticateRefreshToken,
  authController.refresh
);
authRouter.post(
  "/logout",

  authMiddleware.authenticateAccessToken,
  authController.logout
);
authRouter.post(
  "/verify",

  authMiddleware.authenticateUnverifiedAccessToken,
  authController.verify
);
authRouter.post(
  "/reverify",

  authMiddleware.authenticateUnverifiedAccessToken,
  authController.reverify
);
authRouter.post(
  "/accept-terms",

  authMiddleware.authenticateVerifiedAccessToken,
  authController.acceptTerms
);

export default authRouter;
