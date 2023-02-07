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
