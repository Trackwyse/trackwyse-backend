/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import AppleMapsSDK from "apple-maps-server-sdk";

import config from "@/config";

const AppleMaps = new AppleMapsSDK({
  authorizationToken: config.AppleMapsAuthToken,
});

export default AppleMaps;
