import type { TObject } from '@utils/types';

const hasLocalStorage = () => typeof localStorage !== 'undefined';

export const setItem = (key: string, item: string | TObject) => {
  if (hasLocalStorage()) {
    localStorage.setItem(key, JSON.stringify(item));
  }
};

export const getItem = (key: string) => {
  if (hasLocalStorage()) {
    return JSON.parse(localStorage.getItem(key)!);
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
