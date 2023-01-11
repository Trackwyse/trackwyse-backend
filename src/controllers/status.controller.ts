import express from "express";
import appleMaps from "../lib/applemaps";
import { logger } from "../lib/logger";

/*
  GET /status/validClients
  Returns a list of valid clients

  Request Body:
    - None

  Response Body:
    - error: boolean
    - message: string
    - versions: string[]
*/
const getValidClients = async (req: express.Request, res: express.Response) => {
  const version = "011080";

  res.status(200).json({
    error: false,
    message: "Valid clients",
    version,
  });
};

/*
  GET /status/test-connection
  Tests the connection to the database

  Request Body:
    - None

  Response Body:
    - Any
*/
const testConnection = async (req: express.Request, res: express.Response) => {};

export default { getValidClients, testConnection };
