import express from "express";
import statusController from "../controllers/status.controller";

const statusRouter = express.Router();

statusRouter.get("/validClients", statusController.getValidClients);

export default statusRouter;
