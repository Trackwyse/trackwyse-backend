/*
 * Created on Thu Jan 12 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import express from "express";
import type { ETAResponse } from "apple-maps-server-sdk/lib/globals";

import { logger } from "@/lib/logger";
import AppleMaps from "@/lib/applemaps";

/*
  POST /api/v1/location/distance

  Request Body:
    - origin: string
    - destination: string

  Response:
    - error: boolean
    - mesage: string
    - distance?: Eta
*/
const getDistance = async (req: express.Request, res: express.Response) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({
      error: true,
      message: "Missing required fields",
    });
  }

  let response: ETAResponse;
  try {
    response = await AppleMaps.eta({ origin, destinations: destination });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      error: true,
      message: "Invalid origin or destination",
    });
  }

  return res.status(200).json({
    error: false,
    message: "Success",
    distance: response.etas[0],
  });
};

export default {
  getDistance,
};
