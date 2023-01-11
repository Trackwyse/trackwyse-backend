/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import UspsSDK from "usps-webtools-promise";

import config from "@/config";

const USPS = new UspsSDK({
  properCase: true,
  staging: false,
  userId: config.USPSUserId,
});

export default USPS;
