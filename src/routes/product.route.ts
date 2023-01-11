import express from "express";

import authMiddleware from "@/middleware/auth.middleware";
import productController from "@/controllers/product.controller";

const productRouter = express.Router();

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

export { productRouter, labelRouter };
