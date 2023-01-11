import axios from "axios";

import config from "../config";
import { logger } from "./logger";

class AppleMaps {
  private accessToken: string;
  private baseUrl: string;
  private authToken: string;

  constructor() {
    this.accessToken = "";
    this.baseUrl = "https://maps-api.apple.com/v1/";
    this.authToken = config.AppleMapsAuthToken;

    this.fetchAccessToken();
  }

  async fetchAccessToken() {
    axios
      .get(this.baseUrl + "token", {
        headers: {
          Authorization: "Bearer " + this.authToken,
        },
      })
      .then((res) => {
        this.accessToken = res.data.accessToken;
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  async geoCode(address: Address): Promise<Place[]> {
    const res = await axios.get(this.baseUrl + "geocode", {
      headers: {
        Authorization: "Bearer " + this.accessToken,
      },
      params: {
        q: address.address1 + " " + address.city + " " + address.state,
      },
    });

    // check if its 401
    if (res.status === 401) {
      await this.fetchAccessToken();

      // retry
      return this.geoCode(address);
    }

    return res.data.results as Place[];
  }
}

export default new AppleMaps();
