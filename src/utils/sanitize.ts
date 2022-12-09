/**
 * By default, React DOM escapes any values embedded in JSX before rendering them,
 * but sometimes it is necessary to sanitize the user-generated content of received entities.
 * If you use this data in component props without any sanitization or encoding,
 * it might create XSS vulnerabilities.
 *
 * You should especially consider how you are using extended data inside the app.
 */

const ESCAPE_TEXT_REGEXP = /[<>]/g;
const ESCAPE_TEXT_REPLACEMENTS = {
  // fullwidth lesser-than character
  '<': '\uff1c',
  // fullwidth greater-than character
  '>': '\uff1e',
};

const findReplaceCharacter = (ch: string) => {
  switch (ch) {
    case '<':
    case '>':
      return ESCAPE_TEXT_REPLACEMENTS[ch];
    default:
      return ESCAPE_TEXT_REPLACEMENTS['<'];
  }
};

// An example how you could sanitize text content.
// This swaps some coding related characters to less dangerous ones
const sanitizeText = (str: any) =>
  // eslint-disable-next-line no-nested-ternary
  str === null
    ? str
    : typeof str === 'string'
    ? str.replace(ESCAPE_TEXT_REGEXP, (ch) => findReplaceCharacter(ch))
    : '';

/**
 * Sanitize user entity.
 * If you add public data, you should probably sanitize it here.
 * By default, React DOM escapes any values embedded in JSX before rendering them,
 * but if you use this data on props, it might create XSS vulnerabilities
 * E.g. you should sanitize and encode URI if you are creating links from public data.
 */
export const sanitizeUser = (entity: Record<string, any>) => {
  const { attributes, ...restEntity } = entity || {};
  const { profile, ...restAttributes } = attributes || {};
  const { bio, displayName, abbreviatedName, publicData, metadata } =
    profile || {};

  // TODO: If you add public data, you should probably sanitize it here.
  const sanitizedPublicData = publicData ? { publicData } : {};

  // TODO: If you add user-generated metadata through Integration API,
  const sanitizedMetadata =
    // you should probably sanitize it here.
    metadata ? { metadata } : {};

  const profileMaybe = profile
    ? {
        profile: {
          abbreviatedName: sanitizeText(abbreviatedName),
          displayName: sanitizeText(displayName),
          bio: sanitizeText(bio),
          ...sanitizedPublicData,
          ...sanitizedMetadata,
        },
      }
    : {};
  const attributesMaybe = attributes
    ? { attributes: { ...profileMaybe, ...restAttributes } }
    : {};

  return { ...attributesMaybe, ...restEntity };
};

/**
 * Sanitize listing entity.
 * If you add public data, you should probably sanitize it here.
 * By default, React DOM escapes any values embedded in JSX before rendering them,
 * but if you use this data on props, it might create XSS vulnerabilities
 * E.g. you should sanitize and encode URI if you are creating links from public data.
 */
export const sanitizeListing = (entity: Record<string, any>) => {
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

/**
 * Sanitize entities if needed.
 * Remember to add your own sanitization rules for your extended data
 */
export const sanitizeEntity = (entity: Record<string, any>) => {
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
