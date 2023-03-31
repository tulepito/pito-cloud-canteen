import round from 'lodash/round';
import uniq from 'lodash/uniq';

import { denormalisedResponseEntities } from '@services/data';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
import { Listing, User } from '@src/utils/data';
import { EListingType, EOrderStates } from '@src/utils/enums';

export const postRatingFn = async (ratings: any) => {
  const integrationSdk = getIntegrationSdk();
  await Promise.all(
    ratings.map(async (rating: any) => {
      const { restaurantId, ...rest } = rating;
      const { orderId, timestamp } = rest;
      const restaurantListing = await fetchListing(restaurantId, ['author']);
      const listingAuthorUser = User(restaurantListing.author);
      const authorId = listingAuthorUser.getId();
      const response = await integrationSdk.listings.create({
        title: `Review for ${restaurantListing.attributes.title} - ${orderId} - ${timestamp}`,
        authorId,
        state: 'published',
        metadata: {
          ...rating,
          listingType: EListingType.rating,
          reviewRole: UserPermission.BOOKER,
        },
      });

      return denormalisedResponseEntities(response)[0];
    }),
  );
};

export const updateRatingForRestaurantFn = async (ratings: any) => {
  const integrationSdk = getIntegrationSdk();
  const pointOfRatings = ratings.reduce((result: any, rating: any) => {
    const { restaurantId, generalRating, detailRating } = rating;
    if (result?.[restaurantId]) {
      return {
        ...result,
        [restaurantId]: {
          general: result[restaurantId].general + generalRating,
          detail: {
            food: result[restaurantId].detail.food + detailRating.food.rating,
            packaging:
              result[restaurantId].detail.packaging +
              detailRating.packaging.rating,
          },
          totalNumber: result[restaurantId].totalNumber + 1,
        },
      };
    }

    return {
      ...result,
      [restaurantId]: {
        general: generalRating,
        detail: {
          food: detailRating.food.rating,
          packaging: detailRating.packaging.rating,
        },
        totalNumber: 1,
      },
    };
  }, {});

  const restaurantIdList: string[] = uniq(
    ratings.map((rating: any) => rating.restaurantId),
  );
  await Promise.all(
    restaurantIdList.map(async (restaurantId: string) => {
      const restaurant = await fetchListing(restaurantId);
      const restaurantListing = Listing(restaurant);
      const {
        totalRating = 0,
        totalRatingNumber = 0,
        detailRating,
      } = restaurantListing.getMetadata();
      const newTotalRatingNumber =
        totalRatingNumber + pointOfRatings[restaurantId].totalNumber;
      const newTotalRating = round(
        (totalRating * totalRatingNumber +
          pointOfRatings[restaurantId].general) /
          newTotalRatingNumber,
        1,
      );
      const newDetailRating = {
        food: round(
          ((detailRating?.food || 0) * totalRatingNumber +
            pointOfRatings[restaurantId].detail.food) /
            newTotalRatingNumber,
          1,
        ),
        packaging: round(
          ((detailRating?.packaging || 0) * totalRatingNumber +
            pointOfRatings[restaurantId].detail.packaging) /
            newTotalRatingNumber,
          1,
        ),
      };

      await integrationSdk.listings.update({
        id: restaurantId,
        metadata: {
          totalRating: newTotalRating,
          totalRatingNumber: newTotalRatingNumber,
          detailRating: newDetailRating,
        },
      });
    }),
  );
};

export const updateRatingForOrderFn = async ({
  ratings,
  detailTextRating,
  images,
  staff,
  service,
}: {
  ratings: any;
  detailTextRating?: string;
  images: any;
  staff: any;
  service: any;
}) => {
  const integrationSdk = getIntegrationSdk();
  const { orderId } = ratings[0];
  const order = await fetchListing(orderId);
  const orderListing = Listing(order);
  const { orderState, orderStateHistory = [] } = orderListing.getMetadata();
  const ratingStateHistory = {
    state: EOrderStates.reviewed,
    updatedAt: new Date().getTime(),
  };
  await integrationSdk.listings.update({
    id: orderId,
    images,
    metadata: {
      ratings,
      detailTextRating,
      ...(orderState === EOrderStates.completed
        ? {
            orderState: EOrderStates.reviewed,
            orderStateHistory: [...orderStateHistory, ratingStateHistory],
          }
        : {}),

      pitoRating: {
        staff,
        service,
      },
    },
  });
};
