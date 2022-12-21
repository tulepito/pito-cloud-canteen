import jstz from 'jstimezonedetect';

/**
 * Check if the browser's DateTimeFormat API supports time zones.
 *
 * @returns {Boolean} true if the browser returns current timezone.
 */
export const isTimeZoneSupported = () => {
  if (
    !Intl ||
    typeof Intl === 'undefined' ||
    typeof Intl.DateTimeFormat === 'undefined'
  ) {
    return false;
  }

  const dtf = new Intl.DateTimeFormat();
  if (
    typeof dtf === 'undefined' ||
    typeof dtf.resolvedOptions === 'undefined'
  ) {
    return false;
  }
  return !!dtf.resolvedOptions().timeZone;
};
/**
 * Detect the default timezone of user's browser.
 * This function can only be called from client side.
 * I.e. server-side rendering doesn't make sense - it would not return user's timezone.
 *
 * @returns {String} string containing IANA timezone key (e.g. 'Europe/Helsinki')
 */
export const getDefaultTimeZoneOnBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error(
      'Utility function: getDefaultTimeZoneOnBrowser() should be called on client-side only.',
    );
  }

  if (isTimeZoneSupported()) {
    const dtf = new Intl.DateTimeFormat();
    const currentTimeZone = dtf.resolvedOptions().timeZone;
    if (currentTimeZone) {
      return currentTimeZone;
    }
  }

  // Fallback to jstimezonedetect dependency.
  // However, most browsers support Intl.DateTimeFormat already.
  return jstz.determine().name();
};
