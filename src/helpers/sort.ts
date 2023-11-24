import type { TGeoOrigin } from '@helpers/listingSearchQuery';
import { calculateDistance } from '@helpers/mapHelpers';
import type { TListing } from '@src/utils/types';
import { Listing } from '@utils/data';

function defineSortFields(companyGeoOrigin: TGeoOrigin, restaurant: TListing) {
  const { totalRating = 0, totalRatingNumber = 0 } =
    Listing(restaurant).getMetadata();

  const { geolocation: origin } = Listing(restaurant).getAttributes();

  return {
    distance: calculateDistance(companyGeoOrigin, origin),
    totalRating,
    totalRatingNumber,
  };
}

export function sortRestaurants(
  companyGeoOrigin: TGeoOrigin,
  first: TListing,
  second: TListing,
) {
  const firstSortField = defineSortFields(companyGeoOrigin, first);
  const secondSortField = defineSortFields(companyGeoOrigin, second);
  if (firstSortField.distance < secondSortField.distance) return -1;
  if (firstSortField.distance > secondSortField.distance) return 1;

  if (firstSortField.totalRating > secondSortField.totalRating) return -1;
  if (firstSortField.totalRating < secondSortField.totalRating) return 1;

  if (firstSortField.totalRatingNumber > secondSortField.totalRatingNumber)
    return -1;
  if (firstSortField.totalRatingNumber < secondSortField.totalRatingNumber)
    return 1;

  return 0;
}
