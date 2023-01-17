/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";
import User from "@/models/user.model";

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

// bundleId
// "com.js00001.trackwyse"
// productId
// "TRACKWYSE_PLUS"
// transactionId
// "2000000246654193"
// purchaseDate
// 1673384016000
// quantity
// 1
// expirationDate
// 1673384316000
// isTrialPeriod
// false
// environment
// "sandbox"
// originalPurchaseDate
// 1672424400000
// applicationVersion
// "1.1.2"
// originalApplicationVersion
// "1.0"
// _id
// 63bdd07c9a9e12885e259ee4
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
