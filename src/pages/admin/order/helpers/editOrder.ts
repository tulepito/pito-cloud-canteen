import { map } from 'lodash';

import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

export const checkDeliveryHourIsMatchedWithAllRestaurants = ({
  deliveryHour,
  restaurantListings,
  dayInWeek,
}: {
  deliveryHour: string;
  restaurantListings: TListing[];
  dayInWeek: string[];
}) => {
  const [deliveryStartRange, deliveryEndRange] = deliveryHour.split('-');
  const deliveryHourMatchingRestaurantOpenTime = restaurantListings?.map(
    (restaurant) => {
      const {
        availabilityPlan: { entries = [] },
      } = Listing(restaurant).getAttributes();
      const dayInWeekInEntries = entries.filter((entry: TObject) =>
        dayInWeek.includes(entry.dayOfWeek),
      );

      const dayInWeekDeliveryHourMatching = dayInWeekInEntries.map(
        (entry: TObject) => {
          const { startTime, endTime, dayOfWeek } = entry;

          return {
            [dayOfWeek]:
              deliveryStartRange >= startTime && deliveryEndRange <= endTime,
          };
        },
      );

      const summarizedDeliveryHourMatchingRestaurantOpenTimeObj =
        dayInWeekDeliveryHourMatching.reduce((acc: TObject, cur: TObject) => {
          const [key] = Object.keys(cur);
          const [value] = Object.values(cur);
          if (acc[key]) {
            return acc;
          }

          return {
            ...acc,
            [key]: value,
          };
        }, {});

      const summarizedDeliveryHourMatchingRestaurantOpenTimeArr = map(
        summarizedDeliveryHourMatchingRestaurantOpenTimeObj,
        (value, key) => ({ [key]: value }),
      );

      return {
        [restaurant.id.uuid]:
          summarizedDeliveryHourMatchingRestaurantOpenTimeArr,
      };
    },
  );

  const isDeliveryHourMatchingRestaurantOpenTime =
    deliveryHourMatchingRestaurantOpenTime.every((restaurant) =>
      Object.values(restaurant)[0].every(
        (_dayInWeek: TObject) => Object.values(_dayInWeek)[0],
      ),
    );

  return isDeliveryHourMatchingRestaurantOpenTime;
};
