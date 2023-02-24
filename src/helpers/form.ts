import type { TObject } from '@utils/types';
import isEqual from 'lodash/isEqual';

export const customPristine = (intitialValues: TObject, values: TObject) => {
  return isEqual(intitialValues, values);
};
