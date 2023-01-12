/*
 * Created on Wed Jan 11 2023
 * Created by JS00001
 *
 * Copyright (c) 2023 Trackwyse
 */

import geo from "geoip-lite";

// This function should return the city and state of the IP address
const getRelativeLocation = (ip: string): string | null => {
  const geoData = geo.lookup(ip);

  if (!geoData) {
    return null;
  }

  return `${geoData.city}, ${geoData.region}`;
};

export default { getRelativeLocation };
