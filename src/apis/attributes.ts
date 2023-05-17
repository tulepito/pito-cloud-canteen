import { getApi } from './configs';

export const showAttributesApi = () => {
  return getApi('/attributes');
};
