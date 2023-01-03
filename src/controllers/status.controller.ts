import express from "express";
import saleor from "../lib/saleor";

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
  const version = "011020";

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
const testConnection = async (req: express.Request, res: express.Response) => {
  const test = await saleor.Products({ first: 10 });

  res.status(200).json({
    error: false,
    message: "Connection successful",
    test,
  });
};

export default { getValidClients, testConnection };
