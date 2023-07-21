const { ensureListing } = require('./data');

const Listing = (listing) => {
  const ensuredListing = ensureListing(listing);
  const id = ensuredListing?.id?.uuid;
  const { privateData, publicData, protectedData, metadata } =
    ensuredListing.attributes;

  return {
    getId: () => {
      return id;
    },
    getFullData: () => {
      return ensuredListing || {};
    },
    getAttributes: () => {
      return ensuredListing?.attributes || {};
    },
    getMetadata: () => {
      return metadata || {};
    },
    getProtectedData: () => {
      return protectedData || {};
    },
    getPrivateData: () => {
      return privateData || {};
    },
    getPublicData: () => {
      return publicData || {};
    },
  };
};

module.exports = { Listing };
