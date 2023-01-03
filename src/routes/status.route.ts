import express from "express";
import statusController from "../controllers/status.controller";

const statusRouter = express.Router();

statusRouter.get("/valid-clients", statusController.getValidClients);
statusRouter.get("/test-connection", statusController.testConnection);

export default statusRouter;
