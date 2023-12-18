export type TReviewDetail = {
  id: number;
  name: string;
  rating: number;
  foodRating: number;
  eatingUtensilRating: number;
  description: string;
  foodName: string;
  orderDate: Date;
  avatar: string;
};

export type TTotalRating = {
  rating: number;
  total: number;
};
