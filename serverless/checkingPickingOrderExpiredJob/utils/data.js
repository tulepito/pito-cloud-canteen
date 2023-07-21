const reduce = require('lodash/reduce');
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

const ensureListing = (listing) => {
  const empty = {
    id: null,
    type: 'listing',
    attributes: { publicData: {} },
    images: [],
  };
  return { ...empty, ...listing };
};

module.exports = { denormalisedResponseEntities, ensureListing };
