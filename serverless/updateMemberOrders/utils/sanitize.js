const ESCAPE_TEXT_REGEXP = /[<>]/g;
const ESCAPE_TEXT_REPLACEMENTS = {
  // fullwidth lesser-than character
  '<': '\uff1c',
  // fullwidth greater-than character
  '>': '\uff1e',
};

const findReplaceCharacter = (ch) => {
  switch (ch) {
    case '<':
    case '>':
      return ESCAPE_TEXT_REPLACEMENTS[ch];
    default:
      return ESCAPE_TEXT_REPLACEMENTS['<'];
  }
};

const sanitizeText = (str) =>
  str === null
    ? str
    : typeof str === 'string'
    ? str.replace(ESCAPE_TEXT_REGEXP, (ch) => findReplaceCharacter(ch))
    : '';

const sanitizeUser = (entity) => {
  const { attributes, ...restEntity } = entity || {};
  const { profile, ...restAttributes } = attributes || {};
  const {
    bio,
    displayName,
    abbreviatedName,
    publicData,
    metadata,
    privateData,
    firstName,
    lastName,
  } = profile || {};

  // TODO: If you add public data, you should probably sanitize it here.
  const sanitizedPublicData = publicData ? { publicData } : {};

  // TODO: If you add user-generated metadata through Integration API,
  const sanitizedMetadata =
    // you should probably sanitize it here.
    metadata ? { metadata } : {};

  const sanitizedPrivateData = privateData ? { privateData } : {};

  const profileMaybe = profile
    ? {
        profile: {
          firstName: sanitizeText(firstName),
          lastName: sanitizeText(lastName),
          abbreviatedName: sanitizeText(abbreviatedName),
          displayName: sanitizeText(displayName),
          bio: sanitizeText(bio),
          ...sanitizedPublicData,
          ...sanitizedMetadata,
          ...sanitizedPrivateData,
        },
      }
    : {};
  const attributesMaybe = attributes
    ? { attributes: { ...profileMaybe, ...restAttributes } }
    : {};

  return { ...attributesMaybe, ...restEntity };
};

const sanitizeListing = (entity) => {
  const { attributes, ...restEntity } = entity;
  const { title, description, publicData, ...restAttributes } =
    attributes || {};

  // Here's an example how you could sanitize location and rules from publicData:
  // TODO: If you add public data, you should probably sanitize it here.
  const { location, rules, ...restPublicData } = publicData || {};
  const { address, building } = location || {};
  const sanitizedLocation = {
    address: sanitizeText(address),
    building: sanitizeText(building),
  };
  const locationMaybe = location ? { location: sanitizedLocation } : {};
  const rulesMaybe = rules ? { rules: sanitizeText(rules) } : {};
  const sanitizedPublicData = publicData
    ? { publicData: { ...locationMaybe, ...rulesMaybe, ...restPublicData } }
    : {};

  const attributesMaybe = attributes
    ? {
        attributes: {
          title: sanitizeText(title),
          description: sanitizeText(description),
          ...sanitizedPublicData,
          ...restAttributes,
        },
      }
    : {};

  return { ...attributesMaybe, ...restEntity };
};

const sanitizeEntity = (entity) => {
  const { type } = entity;
  switch (type) {
    case 'listing':
      return sanitizeListing(entity);
    case 'user':
      return sanitizeUser(entity);
    default:
      return entity;
  }
};

module.exports = { sanitizeEntity };
