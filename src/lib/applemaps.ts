import AppleMapsSDK from "apple-maps-server-sdk";

import config from "@/config";

const AppleMaps = new AppleMapsSDK({
  authorizationToken: config.AppleMapsAuthToken,
});

export default AppleMaps;
