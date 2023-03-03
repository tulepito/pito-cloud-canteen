import type { TObject } from '@utils/types';
import isEqual from 'lodash/isEqual';

const sortArrayInObject = (obj: TObject) => {
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.sort();
  return Object.keys(obj).reduce((acc: TObject, key) => {
    // eslint-disable-next-line no-param-reassign
    acc[key] = sortArrayInObject(obj[key]);
    return acc;
  }, {});
};

export const customPristine = (intitialValues: TObject, values: TObject) => {
  const newInitialValues = sortArrayInObject(intitialValues);
  const newValues = sortArrayInObject(values);
  return isEqual(newInitialValues, newValues);
};
