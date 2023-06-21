import type { TObject } from '@utils/types';

import { isJson } from './jsonHelper';

const hasLocalStorage = () => typeof localStorage !== 'undefined';

export const setItem = (key: string, item: string | TObject) => {
  if (hasLocalStorage()) {
    localStorage.setItem(key, JSON.stringify(item));
  }
};

export const getItem = (key: string) => {
  if (hasLocalStorage()) {
    const rawItemValue = localStorage.getItem(key);

    return isJson(rawItemValue) ? JSON.parse(rawItemValue!) : rawItemValue;
  }
};

export const removeItem = (key: string) => {
  if (hasLocalStorage()) {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);

      return true;
    }
  }

  return false;
};

export const clear = () => {
  if (hasLocalStorage()) {
    localStorage.clear();
  }
};
