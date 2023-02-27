import type { TObject } from '@utils/types';

export const setItem = (key: string, item: string | TObject) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(item));
  }
};

export const getItem = (key: string) => {
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem(key)) {
      return JSON.parse(localStorage.getItem(key) as string);
    }
    return null;
  }
};

export const removeItem = (key: string) => {
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  }
};

export const clear = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
};
