/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@utils/data';

import type { TListing } from '../../../../utils/types';
import { LISTING_TYPE } from '../../helpers/constants';

const fetchSubOrder = async (orderDetail: any) => {
  let orderDetailResult = {};
  const integrationSdk = getIntegrationSdk();
  const planKeys = Object.keys(orderDetail);
  for (const planKey of planKeys) {
    const planItem = orderDetail[planKey];
    const { restaurant = {} } = planItem;
    const { foodList = {}, id: restaurantId } = restaurant;

    // Fetch restaurant data
    const restaurantData = denormalisedResponseEntities(
      await integrationSdk.listings.show({ id: restaurantId }),
    )[0];

    // Fetch food listings data
    const foodListIds = Object.keys(foodList);
    const foodListData = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        ids: foodListIds.join(','),
        meta_listingType: 'food',
      }),
    );
    orderDetailResult = {
      ...orderDetailResult,
      [planKey]: {
        foodList: foodListData,
        restaurant: restaurantData,
      },
    };
  }

  return orderDetailResult;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();
  const sdk = getSdk(req, res);

  switch (apiMethod) {
    case HttpMethod.GET: {
      const { orderId } = req.query;

      if (!orderId) {
        return res.status(400).json({
          message: 'Missing required keys',
        });
      }

      try {
        // Get order data
        const order = denormalisedResponseEntities(
          await integrationSdk.listings.show({
            id: orderId,
          }),
        )[0];

        // Get company data (user)
        const companyId = order?.attributes.metadata?.companyId || '';
        const company = denormalisedResponseEntities(
          await integrationSdk.users.show(
            {
              id: companyId,
              include: ['profileImage'],
              'fields.image': [
                'variants.square-small',
                'variants.square-small2x',
              ],
            },
            {
              expand: true,
            },
          ),
        )[0];

        // Get list sub-order (plan)
        const planIds = order?.attributes.metadata?.plans || [];
        const plans = denormalisedResponseEntities(
          await integrationSdk.listings.query({
            ids: planIds.join(','),
            meta_listingType: LISTING_TYPE.SUB_ORDER,
          }),
        );

        const subOrderPromises = plans.map(async (plan: TListing) => {
          const { orderDetail } = Listing(plan).getMetadata();
          const planId = Listing(plan).getId();

          return {
            [planId]: await fetchSubOrder(orderDetail),
          };
        });

        const subOrderData = await Promise.all(subOrderPromises);

        return res.json({
          statusCode: 200,
          meta: {},
          data: {
            company,
            order,
            plans,
            subOrders: subOrderData,
          },
        });
      } catch (error) {
        handleError(res, error);
        console.error(error);
      }
      break;
    }

    case HttpMethod.POST: {
      const { orderId } = req.query;
      const { planId, memberOrders, orderDay, orderDays, planData } = req.body;

      try {
        const currentUser = denormalisedResponseEntities(
          await sdk.currentUser.show(),
        )[0];
        const currentUserId = CurrentUser(currentUser).getId();
        const [orderListing] = denormalisedResponseEntities(
          await integrationSdk.listings.show({ id: orderId }),
        );
        const updatingPlan = denormalisedResponseEntities(
          await integrationSdk.listings.show({ id: planId }),
        )[0];

        const { participants = [], anonymous = [] } =
          Listing(orderListing).getMetadata();
        const { orderDetail } = Listing(updatingPlan).getMetadata();

        if (orderDay && memberOrders) {
          orderDetail[orderDay].memberOrders[currentUserId] =
            memberOrders[currentUserId];
        } else if (orderDays && planData) {
          orderDays.forEach((day: any) => {
            orderDetail[day].memberOrders[currentUserId] =
              planData?.[day]?.[currentUserId];
          });
        }

        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail,
          },
        });

        if (
          !participants.includes(currentUserId) &&
          !anonymous.includes(currentUserId)
        ) {
          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              anonymous: anonymous.concat(currentUserId),
            },
          });
        }

        return res.json({ message: 'Update picking successfully' });
      } catch (error) {
        handleError(res, error);
        console.error(error);
      }
      break;
    }
    default:
      break;
  }
};

export default cookies(handler);
