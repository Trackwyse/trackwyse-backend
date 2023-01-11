import AppleMaps from "apple-maps-server-sdk";
import config from "../config";

const appleMaps = new AppleMaps({ authorizationToken: config.AppleMapsAuthToken });

export default appleMaps;
