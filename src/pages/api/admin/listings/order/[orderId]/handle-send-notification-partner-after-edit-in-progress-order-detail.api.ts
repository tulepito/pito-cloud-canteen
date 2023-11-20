import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotificationToPartner } from '@services/nativeNotification';
import { handleError } from '@services/sdk';
import { ENativeNotificationType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const editedSubOrders: any = req.body;
          const { orderId } = req.query;

          const order = await fetchListing(orderId as string);

          const handlePartnerNotification = Object.keys(editedSubOrders).map(
            async (subOrderDate: string) => {
              const { oldValues, restaurant } = editedSubOrders[subOrderDate];
              const previousOldValues = last<TObject>(oldValues) || {};
              const { restaurant: oldRestaurant } = previousOldValues;

              if (isEmpty(oldRestaurant)) {
                return null;
              }

              const oldRestaurantListing = await fetchListing(
                oldRestaurant.id,
                ['author'],
              );
              const oldRestaurantUser = oldRestaurantListing.author;

              if (restaurant.id !== oldRestaurant.id) {
                createNativeNotificationToPartner(
                  ENativeNotificationType.AdminTransitSubOrderToCanceled,
                  {
                    order,
                    partner: oldRestaurantUser,
                    subOrderDate,
                  },
                );
              }
            },
          );

          await Promise.all(handlePartnerNotification);
          res.end();
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
