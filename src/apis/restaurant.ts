import type { TObject } from '@src/utils/types';

import { deleteApi, getDedupApi, postApi } from './configs';

export const queryRestaurantListingsApi = (body: TObject) =>
  postApi('/restaurant/query', body);

export const fetchRecommendedKeywordsApi = () =>
  getDedupApi('/users/recommend-keywords/');

export const deleteRecentKeywordApi = ({ keyword }: { keyword: string }) =>
  deleteApi('/users/recommend-keywords/', { keywords: keyword });
