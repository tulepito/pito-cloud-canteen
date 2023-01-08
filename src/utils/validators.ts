import toPairs from 'lodash/toPairs';

import type { TObject } from './types';

/**
 * Validator functions and helpers for Final Forms
 */

// Final Form expects and undefined value for a successful validation
const VALID = undefined;

const isNonEmptyString = (val: string) => {
  return typeof val === 'string' && val.trim().length > 0;
};

export const required = (message: string) => (value: string) => {
  if (typeof value === 'undefined' || value === null) {
    // undefined or null values are invalid
    return message;
  }
  if (typeof value === 'string') {
    // string must be nonempty when trimmed
    return isNonEmptyString(value) ? VALID : message;
  }
  return VALID;
};

export const requiredStringNoTrim = (message: string) => (value: string) => {
  return typeof value === 'string' && value.length > 0 ? VALID : message;
};

export const requiredFieldArrayCheckbox =
  (message: string) => (value: string) => {
    if (!value) {
      return message;
    }

    const entries = toPairs(value);
    const hasSelectedValues = entries.filter((e: any) => !!e[1]).length > 0;
    return hasSelectedValues ? VALID : message;
  };

export const minLength =
  (message: string, minimumLength: number) => (value: string) => {
    const hasLength = value && typeof value.length === 'number';
    return hasLength && value.length >= minimumLength ? VALID : message;
  };

export const taxLengthRequired = (message: string) => (value: string) => {
  const numberWithoutDash = value.split('-').join('');
  const hasOneDashNumber = value.length - numberWithoutDash.length;
  const hasInvalidChac =
    (value.includes('-') && Number.isNaN(Number(numberWithoutDash))) ||
    (!value.includes('-') && Number.isNaN(Number(value))) ||
    hasOneDashNumber > 1;
  if (hasInvalidChac) {
    return message;
  }
  const hasLength = value && typeof value.length === 'number';
  return hasLength && (value.length === 13 || value.length === 10)
    ? VALID
    : message;
};

export const maxLength =
  (message: string, maximumLength: number) => (value: string) => {
    if (!value) {
      return VALID;
    }
    const hasLength = value && typeof value.length === 'number';
    return hasLength && value.length <= maximumLength ? VALID : message;
  };

export const nonEmptyArray = (message: string) => (value: string) => {
  return value && Array.isArray(value) && value.length > 0 ? VALID : message;
};

export const autocompleteSearchRequired = (message: string) => (value: any) => {
  return value && value.search ? VALID : message;
};

export const autocompletePlaceSelected = (message: string) => (value: any) => {
  const selectedPlaceIsValid =
    value && value.selectedPlace && value.selectedPlace.address;
  return selectedPlaceIsValid ? VALID : message;
};

// Source: http://www.regular-expressions.info/email.html
// See the link above for an explanation of the tradeoffs.
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_NUMBER_RE = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const PWD_RE =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,16}$/;

export const emailFormatValid = (message: string) => (value: string) => {
  return value && EMAIL_RE.test(value) ? VALID : message;
};

export const passwordFormatValid = (message: string) => (value: string) => {
  return value && PWD_RE.test(value) ? VALID : message;
};

export const phoneNumberFormatValid = (message: string) => (value?: string) => {
  const hasValue = !!value || value === '';

  if (!hasValue) return VALID;

  return PHONE_NUMBER_RE.test(value) ? VALID : message;
};

export const passwordMatchConfirmPassword =
  (message: string) => (confirmPassword: string, allValues: TObject) => {
    return allValues &&
      allValues?.password &&
      allValues?.password === confirmPassword
      ? VALID
      : message;
  };

export const parseNum = (str: string) => {
  const num = Number.parseInt(str, 10);
  return Number.isNaN(num) ? null : num;
};

export const validBusinessURL = (message: string) => (value: string) => {
  if (typeof value === 'undefined' || value === null) {
    return message;
  }

  const disallowedChars = /[^-A-Za-z0-9+&@#/%?=~_|!:,.;()]/;
  const protocolTokens = value.split(':');
  const includesProtocol = protocolTokens.length > 1;
  const usesHttpProtocol =
    includesProtocol && !!protocolTokens[0].match(/^(https?)/);

  const invalidCharacters = !!value.match(disallowedChars);
  const invalidProtocol = !(usesHttpProtocol || !includesProtocol);
  // Stripe checks against example.com
  const isExampleDotCom = !!value.match(
    /^(https?:\/\/example\.com|example\.com)/,
  );
  const isLocalhost = !!value.match(
    /^(https?:\/\/localhost($|:|\/)|localhost($|:|\/))/,
  );
  return invalidCharacters || invalidProtocol || isExampleDotCom || isLocalhost
    ? message
    : VALID;
};

export const isInt = (message: string) => (value: any) => {
  return value === parseInt(value, 10) ? VALID : message;
};

export const numberMaxLength =
  (message: string, maximumLength: number) => (value: number) => {
    const parsedValue = Number(value);
    if (!parsedValue) {
      return VALID;
    }
    const isNumber = typeof parsedValue === 'number';
    return isNumber && parsedValue <= maximumLength ? VALID : message;
  };

export const numberMinLength =
  (message: string, minimumLength: number) => (value: number) => {
    const parsedValue = Number(value);
    const isNumber = typeof parsedValue === 'number';
    return isNumber && parsedValue >= minimumLength ? VALID : message;
  };

export const confirmPassword =
  (message: string, fieldNameToCompare: string) =>
  (value: string, allValues: any) => {
    return allValues[fieldNameToCompare] === value ? VALID : message;
  };

export const nonEmptyImage = (message: string) => (value: any) => {
  return value && (value.id || value.imageId) ? VALID : message;
};

export const composeValidatorsWithAllValues =
  (...validators: any) =>
  (value: any, allValues: any, fieldState: any) =>
    validators.reduce(
      (error: any, validator: any) =>
        error || validator(value, allValues, fieldState),
      VALID,
    );

export const composeValidators =
  (...validators: any) =>
  (value: any) =>
    validators.reduce(
      (error: any, validator: any) => error || validator(value),
      VALID,
    );

export const validFacebookUrl = (message: string) => (value: string) => {
  if (!value) return VALID;
  const pattern =
    // eslint-disable-next-line no-useless-escape
    /^(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?$/;
  if (pattern.test(value)) {
    return VALID;
  }
  return message;
};

export const validURL = (message: string) => (str: string) => {
  if (!str) return VALID;
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  if (pattern.test(str)) {
    return VALID;
  }
  return message;
};

export const minPriceLength =
  (message: string, minimumLength: number) => (value: number | number) => {
    const removeComma = value.toString().split(',');
    const mergeWithoutComma = removeComma.join('');
    const parsedValue = Number(mergeWithoutComma);
    const isNumber = typeof parsedValue === 'number';
    return isNumber && parsedValue >= minimumLength ? VALID : message;
  };

export const parsePrice = (value: string = '') => {
  const removeComma = value.toString().split(',');
  const mergeWithoutComma = removeComma.join('');
  const parseNumber = Number(mergeWithoutComma);
  const isNotANumber =
    Number.isNaN(parseNumber) || typeof parseNumber !== 'number';
  return !isNotANumber ? parseNumber.toLocaleString() : value;
};

export const nonNegativeValue = (message: string) => (value: number) => {
  return value <= 0 ? message : VALID;
};
