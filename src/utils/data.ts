import get from 'lodash/get';
import merge from 'lodash/merge';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';

import { sanitizeEntity } from '@utils/sanitize';

import type {
  TAvailabilityException,
  TAvailabilityPlan,
  TCompany,
  TCompanyMemberWithDetails,
  TCurrentUser,
  TIntegrationListing,
  TLineItemCode,
  TListing,
  TObject,
  TOwnListing,
  TTimeSlot,
  TTransaction,
  TUser,
} from './types';

/**
 * Combine the given relationships objects
 *
 * See: http://jsonapi.org/format/#document-resource-object-relationships
 */
export const combinedRelationships = (oldRels: any, newRels: any) => {
  if (!oldRels && !newRels) {
    // Special case to avoid adding an empty relationships object when
    // none of the resource objects had any relationships.
    return null;
  }

  return { ...oldRels, ...newRels };
};

/**
 * Combine the given resource objects
 *
 * See: http://jsonapi.org/format/#document-resource-objects
 */
export const combinedResourceObjects = (oldRes: any, newRes: any) => {
  const { id, type } = oldRes;
  if (newRes.id.uuid !== id.uuid || newRes.type !== type) {
    throw new Error(
      'Cannot merge resource objects with different ids or types',
    );
  }
  const attributes = newRes.attributes || oldRes.attributes;
  const attributesOld = oldRes.attributes || {};
  const attributesNew = newRes.attributes || {};
  // Allow (potentially) sparse attributes to update only relevant fields
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

/**
 * Combine the resource objects form the given api response to the
 * existing entities.
 */
export const updatedEntities = (oldEntities: TObject, apiResponse: any) => {
  const { data, included = [] } = apiResponse;
  const objects = (Array.isArray(data) ? data : [data]).concat(included);

  const newEntities = objects.reduce((entities: TObject, curr) => {
    const { id, type } = curr;

    // Some entities (e.g. listing and user) might include extended data,
    // you should check if src/util/sanitize.js needs to be updated.
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

/**
 * Denormalise the entities with the resources from the entities object
 *
 * This function calculates the dernormalised tree structure from the
 * normalised entities object with all the relationships joined in.
 *
 * @param {Object} entities entities object in the SDK Redux store
 * @param {Array<{ id, type }} resources array of objects
 * with id and type
 * @param {Boolean} throwIfNotFound wheather to skip a resource that
 * is not found (false), or to throw an Error (true)
 *
 * @return {Array} the given resource objects denormalised that were
 * found in the entities
 */
export const denormalisedEntities = (
  entities: any,
  resources: any,
  throwIfNotFound = true,
) => {
  const denormalised = resources.map((res: any) => {
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
      // Recursively join in all the relationship entities
      return reduce(
        relationships,
        (ent: any, relRef: any, relName: string) => {
          // A relationship reference can be either a single object or
          // an array of objects. We want to keep that form in the final
          // result.
          const entData = ent;
          const hasMultipleRefs = Array.isArray(relRef.data);
          const multipleRefsEmpty = hasMultipleRefs && relRef.data.length === 0;
          if (!relRef.data || multipleRefsEmpty) {
            entData[relName] = hasMultipleRefs ? [] : null;
          } else {
            const refs = hasMultipleRefs ? relRef.data : [relRef.data];

            // If a relationship is not found, an Error should be thrown
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

  return denormalised.filter((e: any) => !!e);
};

/**
 * Denormalise the data from the given SDK response
 *
 * @param {Object} sdkResponse response object from an SDK call
 *
 * @return {Array} entities in the response with relationships
 * denormalised from the included data
 */
export const denormalisedResponseEntities = (sdkResponse: any) => {
  const apiResponse = sdkResponse.data;
  const { data } = apiResponse;
  const resources = Array.isArray(data) ? data : [data];

  if (!data || resources.length === 0) {
    return [];
  }

  const entities = updatedEntities({}, apiResponse);

  return denormalisedEntities(entities, resources);
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} transaction entity object, which is to be ensured against null values
 */
export const ensureTransaction = (
  transaction: any,
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

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} booking entity object, which is to be ensured against null values
 */
export const ensureBooking = (booking: any) => {
  const empty = { id: null, type: 'booking', attributes: {} };

  return { ...empty, ...booking };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} listing entity object, which is to be ensured against null values
 */
export const ensureListing = (listing: any) => {
  const empty = {
    id: null,
    type: 'listing',
    attributes: { publicData: {}, metadata: {} },
    images: [],
  };

  return { ...empty, ...listing };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} listing entity object, which is to be ensured against null values
 */
export const ensureOwnListing = (listing: any) => {
  const empty = {
    id: null,
    type: 'ownListing',
    attributes: { publicData: {}, metadata: {} },
    images: [],
  };

  return { ...empty, ...listing };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} user entity object, which is to be ensured against null values
 */
export const ensureUser = (user: any) => {
  const empty = { id: null, type: 'user', attributes: { profile: {} } };

  return merge(empty, user);
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} current user entity object, which is to be ensured against null values
 */
export const ensureCurrentUser = (user: any) => {
  const empty = {
    id: null,
    type: 'currentUser',
    attributes: {
      profile: {},
      emailVerified: false,
      banned: false,
      deleted: false,
    },
    profileImage: {},
  };

  return { ...empty, ...user };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} time slot entity object, which is to be ensured against null values
 */
export const ensureTimeSlot = (timeSlot: TTimeSlot) => {
  const empty = { id: null, type: 'timeSlot', attributes: {} };

  return { ...empty, ...timeSlot };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} availability exception entity object, which is to be ensured against null values
 */
export const ensureDayAvailabilityPlan = (
  availabilityPlan: TAvailabilityPlan,
) => {
  const empty = { type: 'availability-plan/day', entries: [] };

  return { ...empty, ...availabilityPlan };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} availability exception entity object, which is to be ensured against null values
 */
export const ensureAvailabilityException = (
  availabilityException: TAvailabilityException,
) => {
  const empty = { id: null, type: 'availabilityException', attributes: {} };

  return { ...empty, ...availabilityException };
};

/**
 * Get the display name of the given user as string. This function handles
 * missing data (e.g. when the user object is still being downloaded),
 * fully loaded users, as well as banned users.
 *
 * For banned or deleted users, a translated name should be provided.
 *
 * @param {propTypes.user} user
 * @param {String} defaultUserDisplayName
 *
 * @return {String} display name that can be rendered in the UI
 */
export const userDisplayNameAsString = (
  user: TCurrentUser | TUser,
  defaultUserDisplayName: string,
) => {
  const hasAttributes = user && user.attributes;
  const hasProfile = hasAttributes && user.attributes.profile;
  const hasDisplayName = hasProfile && user.attributes.profile.displayName;

  if (hasDisplayName) {
    return user.attributes.profile.displayName;
  }

  return defaultUserDisplayName || '';
};

/**
 * Get the abbreviated name of the given user. This function handles
 * missing data (e.g. when the user object is still being downloaded),
 * fully loaded users, as well as banned users.
 *
 * For banned  or deleted users, a default abbreviated name should be provided.
 *
 * @param {propTypes.user} user
 * @param {String} defaultUserAbbreviatedName
 *
 * @return {String} abbreviated name that can be rendered in the UI
 * (e.g. in Avatar initials)
 */
export const userAbbreviatedName = (
  user: TCurrentUser | TUser,
  defaultUserAbbreviatedName: string,
) => {
  const hasAttributes = user && user.attributes;
  const hasProfile = hasAttributes && user.attributes.profile;
  const hasDisplayName = hasProfile && user.attributes.profile.abbreviatedName;

  if (hasDisplayName) {
    return user.attributes.profile.abbreviatedName;
  }

  return defaultUserAbbreviatedName || '';
};

/**
 * Humanizes a line item code. Strips the "line-item/" namespace
 * definition from the beginnign, replaces dashes with spaces and
 * capitalizes the first character.
 *
 * @param {string} code a line item code
 *
 * @return {string} returns the line item code humanized
 */
export const humanizeLineItemCode = (code: TLineItemCode) => {
  if (!/^line-item\/.+/.test(code)) {
    throw new Error(`Invalid line item code: ${code}`);
  }
  const lowercase = code.replace(/^line-item\//, '').replace(/-/g, ' ');

  return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
};

// ================ Selectors ================ //

/**
 * Get the denormalised listing entities with the given IDs
 *
 * @param {Object} state the full Redux store
 * @param {Array<UUID>} listingIds listing IDs to select from the store
 */
export const getListingsById = (state: any, listingIds: any[]) => {
  const { entities } = state.marketplaceData;
  const resources = listingIds.map((id) => ({
    id,
    type: 'listing',
  }));
  const throwIfNotFound = false;

  return denormalisedEntities(entities, resources, throwIfNotFound);
};

/**
 * Get the denormalised entities from the given entity references.
 *
 * @param {Object} state the full Redux store
 *
 * @param {Array<{ id, type }>} entityRefs References to entities that
 * we want to query from the data. Currently we expect that all the
 * entities have the same type.
 *
 * @return {Array<Object>} denormalised entities
 */
export const getMarketplaceEntities = (state: any, entityRefs: any[]) => {
  const { entities } = state.marketplaceData;
  const throwIfNotFound = false;

  return denormalisedEntities(entities, entityRefs, throwIfNotFound);
};

export const entityRefs = (entities: any) =>
  entities.map((entity: any) => ({
    id: entity.id,
    type: entity.type,
  }));

export const CurrentUser = (user: TCurrentUser) => {
  const ensuredUser = ensureCurrentUser(user);
  const { attributes } = ensuredUser;

  return {
    getId: () => {
      return ensuredUser.id?.uuid;
    },
    getFullData: () => {
      return ensuredUser;
    },
    getAttributes: () => {
      return attributes;
    },
    getProfile: () => {
      return attributes.profile;
    },
    getMetadata: (): TObject => {
      return get(attributes.profile, 'metadata', {});
    },
    getProtectedData: (): TObject => {
      return get(attributes.profile, 'protectedData', {});
    },
    getPrivateData: (): TObject => {
      return get(attributes.profile, 'privateData', {});
    },
    getPublicData: (): TObject => {
      return get(attributes.profile, 'publicData', {});
    },
    getProfileImage: () => {
      return ensuredUser?.profileImage || null;
    },
  };
};

export const User = (user: TUser | TCurrentUser | TCompany) => {
  const ensuredUser = ensureUser(user);
  const { attributes } = ensuredUser;

  return {
    getId: () => {
      return ensuredUser.id?.uuid;
    },
    getFullData: () => {
      return ensuredUser || {};
    },
    getAttributes: () => {
      return attributes || {};
    },
    getProfile: () => {
      return attributes.profile;
    },
    getMetadata: (): TObject => {
      return get(attributes.profile, 'metadata', {});
    },
    getProtectedData: (): TObject => {
      return get(attributes.profile, 'protectedData', {});
    },
    getPrivateData: (): TObject => {
      return get(attributes.profile, 'privateData', {});
    },
    getPublicData: (): TObject => {
      return get(attributes.profile, 'publicData', {});
    },
    getProfileImage: () => {
      return ensuredUser.profileImage || null;
    },
  };
};

export const Listing = (listing: TListing | null) => {
  const ensuredListing = ensureListing(listing);
  const { attributes } = ensuredListing;

  return {
    getId: () => {
      return ensuredListing.id?.uuid;
    },
    getFullData: () => {
      return ensuredListing;
    },
    getAttributes: () => {
      return attributes;
    },
    getPublicData: (): TObject => {
      return get(attributes, 'publicData');
    },
    getMetadata: (): TObject => {
      return get(attributes, 'metadata');
    },
    getProtectedData: (): TObject => {
      return get(attributes, 'protectedData', {});
    },
    getPrivateData: (): TObject => {
      return get(attributes, 'privateData', {});
    },
    getImages: () => {
      return ensuredListing.images;
    },
  };
};

export const OwnListing = (listing: TOwnListing) => {
  const ensuredListing = ensureOwnListing(listing);
  const { attributes } = ensuredListing;

  return {
    getId: () => {
      return ensuredListing.id?.uuid;
    },
    getFullData: () => {
      return ensuredListing;
    },
    getAttributes: () => {
      return attributes;
    },
    getPublicData: (): TObject => {
      return get(attributes, 'publicData');
    },
    getMetadata: (): TObject => {
      return get(attributes, 'metadata');
    },
    getProtectedData: (): TObject => {
      return get(attributes, 'protectedData', {});
    },
    getPrivateData: (): TObject => {
      return get(attributes, 'privateData', {});
    },
  };
};

export const Transaction = (transaction: TTransaction) => {
  const ensuredTransaction = ensureTransaction(transaction);
  const { attributes } = ensuredTransaction;

  return {
    getId: () => {
      return ensuredTransaction.id?.uuid;
    },
    getFullData: () => {
      return ensuredTransaction;
    },
    getAttributes: () => {
      return attributes;
    },
    getProtectedData: (): TObject => {
      return get(attributes, 'protectedData', {});
    },
    getMetadata: (): TObject => {
      return get(attributes, 'metadata', {});
    },
  };
};

export const TransactionWithExtendedData = (transaction: TTransaction) => {
  const originTransaction = Transaction(transaction);
  const { listing, provider, booking, customer } = transaction;

  return {
    ...originTransaction,
    getListing: () => {
      return listing || {};
    },
    getBooking: () => {
      return booking || {};
    },
    getCustomer: () => {
      return customer || {};
    },
    getProvider: () => {
      return provider || {};
    },
  };
};

export const getArrayByUuid = (items: any[]) => {
  const resArr = [] as any[];
  items.forEach((item) => {
    if (!item?.id) {
      return;
    }
    const i = resArr.findIndex((x) => x.id === item.id);
    if (i <= -1) {
      resArr.push(item);
    }
  });

  return resArr;
};

export const IntegrationListing = (
  listing: TIntegrationListing | undefined | null,
) => {
  const ensuredListing = ensureListing(listing);
  const { attributes } = ensuredListing;

  return {
    getId: () => {
      return ensuredListing.id?.uuid;
    },
    getFullData: () => {
      return ensuredListing;
    },
    getAttributes: () => {
      return attributes;
    },
    getPublicData: (): TObject => {
      return get(attributes, 'publicData');
    },
    getMetadata: (): TObject => {
      return get(attributes, 'metadata');
    },
    getProtectedData: (): TObject => {
      return get(attributes, 'protectedData', {});
    },
    getPrivateData: (): TObject => {
      return get(attributes, 'privateData', {});
    },
  };
};

export const IntegrationMenuListing = (
  listing: TIntegrationListing | undefined | null,
) => {
  const ensuredListing = ensureListing(listing);
  const { attributes } = ensuredListing;
  const { metadata } = attributes;

  const {
    monFoodIdList = [],
    tueFoodIdList = [],
    wedFoodIdList = [],
    thuFoodIdList = [],
    friFoodIdList = [],
    satFoodIdList = [],
    sunFoodIdList = [],
  } = metadata;
  const listFoodIds = uniq([
    ...monFoodIdList,
    ...tueFoodIdList,
    ...wedFoodIdList,
    ...thuFoodIdList,
    ...friFoodIdList,
    ...satFoodIdList,
    ...sunFoodIdList,
  ]);

  return {
    ...IntegrationListing(listing),
    getListFoodIds: () => {
      return listFoodIds;
    },
  };
};

export const getUniqueString = (list: string[]) => {
  return list.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

export const getUniqueCompanyMemberByEmail = (
  list: TCompanyMemberWithDetails[],
) => {
  const resArr: TCompanyMemberWithDetails[] = [];
  list.forEach((item) => {
    const i = resArr.findIndex((x) => {
      if (x?.attributes?.email) {
        return (
          x?.attributes?.email === item?.attributes?.email ||
          x?.attributes?.email === item?.email
        );
      }

      return x?.email === item?.attributes?.email || x?.email === item?.email;
    });
    if (i <= -1) {
      resArr.push(item);
    }
  });

  return resArr;
};

export const getUniqueUsers = (users: TUser[]) => {
  const userMap = users.reduce((acc, user) => {
    const id = User(user).getId();
    const newUserMap = { ...acc } as any;
    newUserMap[id as any] = user;

    return newUserMap;
  }, {});

  return Object.values(userMap) as TUser[];
};

export const getDataWithRemovedOtherField = (arr: string[]) =>
  arr.filter((item: string) => item !== 'other');

export const getListWithNewOtherValues = (
  newOtherValue: string,
  oldOtherValue: string,
  list: string[],
  hasOtherValueInList: boolean,
) => {
  const newList = [...list];

  const oldOtherItemIndex = newList.indexOf(oldOtherValue);
  if (!hasOtherValueInList && oldOtherItemIndex >= 0) {
    newList.splice(oldOtherItemIndex, 1);

    return newList;
  }

  const otherValueIndex = newList.findIndex(
    (str: string) => str === newOtherValue,
  );

  const notChange = newOtherValue === oldOtherValue;
  // otherValueIndex >= 0 is value not change => don't need to update
  //! otherValue is other is null => don't need to add

  if (otherValueIndex >= 0 || !newOtherValue || notChange) {
    return newList;
  }

  // replace old other value to new other value

  if (oldOtherItemIndex >= 0) {
    newList[oldOtherItemIndex] = newOtherValue;
  } else {
    newList.push(newOtherValue);
  }

  return newList;
};

export const getLocationInitialValues = (partnerListing: any) => {
  const { geolocation, publicData } = partnerListing.attributes || {};

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent =
    publicData &&
    publicData.location &&
    publicData.location.address &&
    geolocation;
  const location = publicData && publicData.location ? publicData.location : {};
  const { address } = location;

  return locationFieldsPresent
    ? {
        search: address,
        selectedPlace: { address, origin: geolocation },
      }
    : {};
};
