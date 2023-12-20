import _ from 'lodash';

import { queryAllListings } from '@helpers/apiHelpers';
import { EListingType } from '@src/utils/enums';
import { Listing } from '@utils/data';

const getReviews = async (
  restaurantId: string,
  page: number,
  perPage: number,
  ratings: number[],
  sdk: any,
) => {
  const query = {
    meta_listingType: EListingType.rating,
    meta_restaurantId: restaurantId,
  };

  if (ratings.length >= 5 || !ratings.length) {
    const response = await sdk.listings.query({
      ...query,
      ...(page && { page }),
      ...(perPage && { perPage }),
    });

    const { meta: pagination, data = [] } = response.data;

    return {
      pagination,
      data,
    };
  }

  const reviewListings: [] = await queryAllListings({
    query,
  });
  const filterReview = reviewListings.filter((reivew) => {
    const { generalRating } = Listing(reivew).getMetadata();

    return ratings.findIndex((rating) => rating === generalRating) >= 0;
  });
  const totalPages = Math.ceil(filterReview.length / 10);

  const pagination = {
    totalItems: filterReview.length,
    totalPages,
    page,
    perPage,
    paginationLimit: totalPages,
  };

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const data = _.slice(filterReview, startIndex, endIndex);

  return {
    pagination,
    data,
  };
};

export default getReviews;
