import UspsSDK from "usps-webtools-promise";

import config from "@/config";

const USPS = new UspsSDK({
  properCase: true,
  staging: false,
  userId: config.USPSUserId,
});

export default USPS;
