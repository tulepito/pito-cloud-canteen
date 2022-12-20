/* eslint-disable no-param-reassign */
const reduce = require('lodash/reduce');

const combinedRelationships = (oldRels: any, newRels: any) => {
  if (!oldRels && !newRels) {
    // Special case to avoid adding an empty relationships object when
    // none of the resource objects had any relationships.
    return null;
  }
  return { ...oldRels, ...newRels };
};

const combinedResourceObjects = (oldRes: any, newRes: any) => {
  const { id, type } = oldRes;
  if (newRes.id.uuid !== id.uuid || newRes.type !== type) {
    throw new Error(
      'Cannot merge resource objects with different ids or types',
    );
  }
  const attributes = newRes.attributes || oldRes.attributes;
  const attrs = attributes ? { attributes: { ...attributes } } : null;
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
const updatedEntities = (oldEntities: any, apiResponse: any) => {
  const { data, included = [] } = apiResponse;
  const objects = (Array.isArray(data) ? data : [data]).concat(included);

  const newEntities = objects.reduce((entities, curr) => {
    const { id, type } = curr;
    entities[type] = entities[type] || {};
    const entity = entities[type][id.uuid];
    entities[type][id.uuid] = entity
      ? combinedResourceObjects(entity, curr)
      : curr;
    return entities;
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
const denormalisedEntities = (
  entities: any,
  resources: any,
  throwIfNotFound: boolean = true,
) => {
  const denormalised = resources.map((res: any) => {
    const { id, type } = res;
    const entityFound = entities[type] && id && entities[type][id.uuid || id];
    if (!entityFound) {
      if (throwIfNotFound) {
        throw new Error(
          `Entity with type "${type}" and id "${id ? id.uuid : id}" not found`,
        );
      }
      return null;
    }
    const entity = entities[type][id.uuid || id];
    const { relationships, ...entityData } = entity;

    if (relationships) {
      // Recursively join in all the relationship entities
      return reduce(
        relationships,
        (ent: any, relRef: any, relName: any) => {
          // A relationship reference can be either a single object or
          // an array of objects. We want to keep that form in the final
          // result.
          const hasMultipleRefs = Array.isArray(relRef.data);
          const multipleRefsEmpty = hasMultipleRefs && relRef.data.length === 0;
          if (!relRef.data || multipleRefsEmpty) {
            ent[relName] = hasMultipleRefs ? [] : null;
          } else {
            const refs = hasMultipleRefs ? relRef.data : [relRef.data];

            // If a relationship is not found, an Error should be thrown
            const rels = denormalisedEntities(entities, refs, true);

            ent[relName] = hasMultipleRefs ? rels : rels[0];
          }
          return ent;
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
