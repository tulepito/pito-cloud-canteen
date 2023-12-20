import type { TUser } from '@src/utils/types';

export type TReviewDetail = {
  id: number;
  name: string;
  rating: number;
  foodRating: number;
  packagingRating: number;
  description: string;
  foodName: string;
  createdAt: string;
  user: TUser;
};

export type TTotalRating = {
  rating: number;
  total: number;
};
