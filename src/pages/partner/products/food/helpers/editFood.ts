import type { TObject } from '@src/utils/types';

export const NEW_FOOD_ID = '00000000-0000-0000-0000-000000000000';

export const getObjectDifferences = (obj1: TObject, obj2: TObject) => {
  const differences: any = {};

  Object.keys(obj1).forEach((key) => {
    if (obj1[key] && obj1[key] !== obj2[key]) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        const subDifferences = getObjectDifferences(obj1[key], obj2[key]);
        if (Object.keys(subDifferences).length > 0) {
          differences[key] = subDifferences;
        }

        return;
      }
      differences[key] = {
        oldValue: obj1[key],
        newValue: obj2[key],
      };
    }
  });

  Object.keys(obj2).forEach((key) => {
    if (obj2[key] && !obj1[key]) {
      if (typeof obj2[key] === 'object') {
        differences[key] = getObjectDifferences({}, obj2[key]);

        return;
      }

      differences[key] = {
        oldValue: undefined,
        newValue: obj2[key],
      };
    }
  });

  return differences;
};
