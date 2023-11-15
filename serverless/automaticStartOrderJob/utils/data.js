const reduce = require('lodash/reduce');
const merge = require('lodash/merge');
const { sanitizeEntity } = require('./sanitize');

const combinedRelationships = (oldRels, newRels) => {
  if (!oldRels && !newRels) {
    return null;
  }

  return { ...oldRels, ...newRels };
};

const combinedResourceObjects = (oldRes, newRes) => {
  const { id, type } = oldRes;
  if (newRes.id.uuid !== id.uuid || newRes.type !== type) {
    throw new Error(
      'Cannot merge resource objects with different ids or types',
    );
  }
  const attributes = newRes.attributes || oldRes.attributes;
  const attributesOld = oldRes.attributes || {};
  const attributesNew = newRes.attributes || {};

  const attrs = attributes
    ? { attributes: { ...attributesOld, ...attributesNew } }
    : null;
  const relationships = combinedRelationships(
    oldRes.relationships,
    newRes.relationships,
  );
  const rels = relationships ? { relationships } : null;

  return { id, type, ...attrs, ...rels };
};

const updatedEntities = (oldEntities, apiResponse) => {
  const { data, included = [] } = apiResponse;
  const objects = (Array.isArray(data) ? data : [data]).concat(included);

  const newEntities = objects.reduce((entities, curr) => {
    const { id, type } = curr;

    const current = sanitizeEntity(curr);

    const entitiesData = entities;
    entitiesData[type] = entities[type] || {};
    const entity = entities[type][id.uuid];
    entitiesData[type][id.uuid] = entity
      ? combinedResourceObjects({ ...entity }, current)
      : current;

    return entitiesData;
  }, oldEntities);

  return newEntities;
};

const denormalisedEntities = (entities, resources, throwIfNotFound = true) => {
  const denormalised = resources.map((res) => {
    const { id, type } = res;
    const entityFound = entities[type] && id && entities[type][id.uuid];
    if (!entityFound) {
      if (throwIfNotFound) {
        throw new Error(
          `Entity with type "${type}" and id "${id ? id.uuid : id}" not found`,
        );
      }

      return null;
    }
    const entity = entities[type][id.uuid];
    const { relationships, ...entityData } = entity;

    if (relationships) {
      return reduce(
        relationships,
        (ent, relRef, relName) => {
          const entData = ent;
          const hasMultipleRefs = Array.isArray(relRef.data);
          const multipleRefsEmpty = hasMultipleRefs && relRef.data.length === 0;
          if (!relRef.data || multipleRefsEmpty) {
            entData[relName] = hasMultipleRefs ? [] : null;
          } else {
            const refs = hasMultipleRefs ? relRef.data : [relRef.data];

            const rels = denormalisedEntities(entities, refs, true);

            entData[relName] = hasMultipleRefs ? rels : rels[0];
          }

          return entData;
        },
        entityData,
      );
    }

    return entityData;
  });

  return denormalised.filter((e) => !!e);
};

const denormalisedResponseEntities = (sdkResponse) => {
  const apiResponse = sdkResponse.data;
  const { data } = apiResponse;
  const resources = Array.isArray(data) ? data : [data];

  if (!data || resources.length === 0) {
    return [];
  }

  const entities = updatedEntities({}, apiResponse);

  return denormalisedEntities(entities, resources);
};

export const ensureUser = (user) => {
  const empty = { id: null, type: 'user', attributes: { profile: {} } };

  return merge(empty, user);
};

const ensureListing = (listing) => {
  const empty = {
    id: null,
    type: 'listing',
    attributes: { publicData: {}, metadata: {} },
    images: [],
  };

  return { ...empty, ...listing };
};

const User = (user) => {
  const ensuredUser = ensureUser(user);
  const id = ensuredUser?.id?.uuid;
  const { attributes, profileImage } = ensuredUser;
  const { profile } = attributes;
  const { privateData, publicData, protectedData, metadata } = profile || {};

  return {
    getId: () => {
      return id;
    },
    getFullData: () => {
      return ensuredUser || {};
    },
    getAttributes: () => {
      return attributes || {};
    },
    getProfile: () => {
      return profile || {};
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
    getProfileImage: () => {
      return profileImage || null;
    },
  };
};

const Listing = (listing) => {
  const ensuredListing = ensureListing(listing);
  const id = ensuredListing.id?.uuid;

  return {
    getId: () => {
      return id;
    },
    getFullData: () => {
      return ensuredListing;
    },
    getAttributes: () => {
      return ensuredListing.attributes;
    },
    getMetadata: () => {
      return ensuredListing.attributes.metadata;
    },
    getProtectedData: () => {
      return ensuredListing.attributes.protectedData;
    },
    getPrivateData: () => {
      return ensuredListing.attributes.privateData;
    },
    getPublicData: () => {
      return ensuredListing.attributes.publicData;
    },
    getImages: () => {
      return ensuredListing.images;
    },
  };
};

export const ensureTransaction = (
  transaction,
  booking = null,
  listing = null,
  provider = null,
) => {
  const empty = {
    id: null,
    type: 'transaction',
    attributes: {},
    booking,
    listing,
    provider,
  };

  return { ...empty, ...transaction };
};

const Transaction = (transaction) => {
  const ensuredTransaction = ensureTransaction(transaction);
  const id = ensuredTransaction?.id?.uuid;
  const attributes = ensuredTransaction?.attributes;
  const { privateData, publicData, protectedData, metadata } = attributes || {};

  return {
    getId: () => {
      return id;
    },
    getFullData: () => {
      return ensuredTransaction;
    },
    getAttributes: () => {
      return attributes;
    },
    getMetadata: () => {
      return metadata;
    },
    getProtectedData: () => {
      return protectedData;
    },
    getPrivateData: () => {
      return privateData;
    },
    getPublicData: () => {
      return publicData;
    },
  };
};

module.exports = {
  denormalisedResponseEntities,
  ensureListing,
  Transaction,
  Listing,
  User,
};
