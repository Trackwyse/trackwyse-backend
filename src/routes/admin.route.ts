/*
 * Created on Mon Jan 16 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import adminController from "@/controllers/admin.controller";

const adminRouter = express.Router();

adminRouter.post(
  "/set-premium",
  authMiddleware.authenticateAdminAccessToken,
  adminController.setPremium
);

export default adminRouter;
