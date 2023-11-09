import type { TObject } from '@src/utils/types';

import { postApi } from './configs';

export const queryRestaurantListingsApi = (body: TObject) =>
  postApi('/restaurant/query', body);
