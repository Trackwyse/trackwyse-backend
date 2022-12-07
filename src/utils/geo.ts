import geo from 'geoip-lite';

// This function should return the city and state of the IP address
const getRelativeLocation = (ip: string): string | null => {
  const geoData = geo.lookup(ip);

  if (!geoData) {
    return null;
  }

  return `${geoData.city}, ${geoData.region}`;
};

export default { getRelativeLocation };
