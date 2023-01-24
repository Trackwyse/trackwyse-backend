/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import productController from "@/controllers/labels.controller";

const labelRouter = express.Router();
labelRouter.post("/create", authMiddleware.attachAccessToken, productController.createLabel); // TEMPORARY

labelRouter.post("/found/:labelId", authMiddleware.attachAccessToken, productController.foundLabel);

labelRouter.get("/", authMiddleware.authenticateVerifiedAccessToken, productController.getLabels);
labelRouter.post(
  "/add/:labelId",
  authMiddleware.authenticateVerifiedAccessToken,
  productController.addLabel
);
labelRouter.patch(
  "/modify/:labelId",
  authMiddleware.authenticateVerifiedAccessToken,
  productController.modifyLabel
);
labelRouter.delete(
  "/delete/:labelId",
  authMiddleware.authenticateVerifiedAccessToken,
  productController.deleteLabel
);
labelRouter.post(
  "/recovered/:labelId",
  authMiddleware.authenticateVerifiedAccessToken,
  productController.recoveredLabel
);

export default labelRouter;
