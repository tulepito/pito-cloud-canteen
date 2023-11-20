import type { TObject } from '@utils/types';

const urlSerialize = (obj: TObject = {}) => {
  const str: Array<string> = [];
  Object.keys(obj).forEach((p: any) => {
    str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
  });

  return str.join('&');
};

export const stringify = (params: {
  [name: string]: string | string[] | number | boolean | null | undefined;
}): string => {
  const cleaned = Object.keys(params).reduce(
    (result: { [name: string]: any }, key: string) => {
      const val = params[key];
      if (val !== null) {
        // eslint-disable-next-line no-param-reassign
        result[key] = val;
      }

      return result;
    },
    {},
  );

  return urlSerialize(cleaned);
};

export const historyPushState = (state: string, value: string | number) => {
  const url = new URL(window.location.href);
  url.searchParams.set(state.toString(), value.toString());
  window.history.pushState({}, '', url);
};

export const parseLocationSearchToObject = () => {
  const search = window?.location?.search?.slice(1);

  return search
    ? JSON.parse(
        `{"${decodeURI(search)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"')}"}`,
      )
    : {};
};
