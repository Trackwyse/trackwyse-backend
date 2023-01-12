/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";
import statusController from "@/controllers/status.controller";

const statusRouter = express.Router();

statusRouter.get("/valid-clients", statusController.getValidClients);
statusRouter.post("/test-connection", statusController.testConnection);

export default statusRouter;
