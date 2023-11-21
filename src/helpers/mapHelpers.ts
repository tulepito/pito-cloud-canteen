export const getInitialLocationValues = (location: any) => {
  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent = location && location.address && location.origin;

  const { address, origin } = location || {};

  return locationFieldsPresent
    ? {
        predictions: [],
        search: address,
        selectedPlace: { address, origin },
      }
    : null;
};

export const calculateDistance = (origin: any, destination: any) => {
  const { lat: lat1, lng: lng1 } = origin || {};
  const { lat: lat2, lng: lng2 } = destination || {};
  const R = 6371; // in km
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // in km
};

export const calculateBounds = (origin: any, radius: any) => {
  const { lat, lng } = origin;
  const R = 6371; // in km
  const distance = radius; // in km
  const radLat = (lat * Math.PI) / 180;
  const radLng = (lng * Math.PI) / 180;
  const minLat = radLat - distance / R;
  const maxLat = radLat + distance / R;
  const minLng = radLng - distance / (R * Math.cos((Math.PI * lat) / 180));
  const maxLng = radLng + distance / (R * Math.cos((Math.PI * lat) / 180));

  const north = maxLat * (180 / Math.PI);
  const south = minLat * (180 / Math.PI);
  const east = maxLng * (180 / Math.PI);
  const west = minLng * (180 / Math.PI);

  return `${north},${east},${south},${west}`;
};
