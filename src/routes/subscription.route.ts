import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import subscriptionController from "../controllers/subscription.controller";

const subscriptionRouter = express.Router();

subscriptionRouter.get(
  "/",
  authMiddleware.authenticateVerifiedAccessToken,
  subscriptionController.getSubscription
);
subscriptionRouter.post(
  "/create",
  authMiddleware.authenticateVerifiedAccessToken,
  subscriptionController.createSubscription
);
subscriptionRouter.post(
  "/claim/free-labels",
  authMiddleware.authenticateVerifiedAccessToken,
  subscriptionController.claimFreeLabels
);

export default subscriptionRouter;
