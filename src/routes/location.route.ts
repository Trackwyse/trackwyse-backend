/*
 * Created on Thu Jan 12 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import locationController from "@/controllers/location.controller";

const locationRouter = express.Router();

locationRouter.post(
  "/distance",
  authMiddleware.authenticateVerifiedAccessToken,
  locationController.getDistance
);

export default locationRouter;
