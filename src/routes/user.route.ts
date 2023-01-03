import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.get("/", authMiddleware.authenticateAccessToken, userController.getUser);
userRouter.patch(
  "/update",
  authMiddleware.authenticateVerifiedAccessToken,
  userController.updateUser
);
userRouter.post(
  "/update-password",
  authMiddleware.authenticateVerifiedAccessToken,
  userController.updatePassword
);

export default userRouter;
