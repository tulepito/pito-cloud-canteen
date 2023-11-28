import isEqual from 'lodash/isEqual';

import type { TObject } from '@utils/types';

const sortArrayInObject = (obj: TObject) => {
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      try {
        return Object.freeze(obj.sort());
      } catch (error) {
        // Code to handle the exception
        console.error(`An error occurred: ${error}`);

        return obj;
      }
    }

    return obj;
  }

  return Object.keys(obj).reduce((acc: TObject, key) => {
    acc[key] = sortArrayInObject(obj[key]);

    return acc;
  }, {});
};

export const customPristine = (initialValues: TObject, values: TObject) => {
  const newInitialValues = sortArrayInObject(initialValues);
  const newValues = sortArrayInObject(values);

  return isEqual(newInitialValues, newValues);
};
