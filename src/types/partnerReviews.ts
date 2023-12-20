export type TReviewDetail = {
  id: number;
  name: string;
  rating: number;
  foodRating: number;
  packagingRating: number;
  description: string;
  foodName: string;
  createdAt: string;
  avatar: string;
};

export type TTotalRating = {
  rating: number;
  total: number;
};
