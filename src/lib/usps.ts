import USPS from "usps-webtools-promise";

import config from "@/config";

const usps = new USPS({
  properCase: true,
  staging: false,
  userId: config.USPSUserId,
});

export default usps;
