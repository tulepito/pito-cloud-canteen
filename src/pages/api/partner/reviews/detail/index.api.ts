import { uniq } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllListings } from '@helpers/apiHelpers';
import { getOrderAndPlan } from '@pages/api/orders/[orderId]/get.service';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import partnerChecker from '@services/permissionChecker/partner';
import { getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
  User,
} from '@src/utils/data';
import { EListingType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { JSONParams = '' } = req.query;
    const sdk = getSdk(req, res);

    switch (apiMethod) {
      case HttpMethod.GET: {
        const {
          rating: ratings = [],
          page,
          pageSize,
        } = JSON.parse(JSONParams as string);
        console.log('rating', ratings);

        const currentUserRes = await sdk.currentUser.show();
        const [companyAccount] = denormalisedResponseEntities(currentUserRes);
        const { restaurantListingId: restaurantId } =
          CurrentUser(companyAccount).getMetadata();

        const reviews = await queryAllListings({
          query: {
            meta_listingType: EListingType.rating,
            meta_restaurantId: restaurantId,
          },
        });

        // const userReview: Promise<any>;
        // const mapOrders = new Map<string, any>();
        // const mapUsers = new Map<string, any>();
        const userIds: string[] = [];
        const orderIds: string[] = [];

        const rawDetailData: [] = reviews.map((review: TListing) => {
          const reviewListing = Listing(review);
          const id = reviewListing.getId();
          const {
            generalRating: rating,
            detailRating,
            reviewerId,
            timestamp,
            orderId,
          } = reviewListing.getMetadata();

          userIds.push(reviewerId);
          orderIds.push(orderId);

          const { rating: foodRating } = detailRating.food;
          const { rating: packagingRating } = detailRating.packaging;
          const { createdAt } = reviewListing.getAttributes();

          return {
            id,
            rating,
            foodRating,
            packagingRating,
            createdAt,
            timestamp,
            orderId,
            reviewerId,
          };
        });

        const fetchUsers = await Promise.all(
          uniq(userIds).map((userId) => fetchUser(userId)),
        );

        const mapUserById = fetchUsers.reduce((acc, user) => {
          const id = User(user).getId();
          if (!acc.has(id)) {
            acc.set(id, user);
          }

          return acc;
        }, new Map<string, any>());

        const fetchOrders = await Promise.all(
          uniq(orderIds).map((orderId: string) => getOrderAndPlan({ orderId })),
        );

        const mapOrderById = fetchOrders.reduce((acc, order) => {
          const id = order.orderListing.id.uuid;
          if (!acc.has(id)) {
            acc.set(id, order);
          }

          return acc;
        }, new Map<string, any>());

        const reviewDetailData = rawDetailData.map((rawData) => {
          const {
            id,
            rating,
            foodRating,
            packagingRating,
            createdAt,
            timestamp,
            orderId,
            reviewerId,
          } = rawData;

          let name = '';
          const user = mapUserById.get(reviewerId);
          if (user) {
            name = User(user).getAttributes().profile.displayName;
          }

          let description = '';
          let foodName = '';
          const order = mapOrderById.get(orderId);
          if (order) {
            description = Listing(order.orderListing).getMetadata()
              .detailTextRating;
            const { orderDetail } = Listing(order.planListing).getMetadata();
            const { lineItems = [] } = orderDetail[String(timestamp)];
            foodName = lineItems.length ? lineItems[0].name : '';
          }

          const avatar = 'avatar';

          return {
            id,
            rating,
            foodRating,
            packagingRating,
            createdAt,

            description,
            name,
            foodName,
            avatar,
          };
        });

        const totalReviewDetailData = reviewDetailData.length;
        const pagination = {
          totalItems: totalReviewDetailData,
          totalPages: Math.ceil(totalReviewDetailData / pageSize),
          page,
          perPage: pageSize,
        };

        return res.status(200).json({
          reviewDetailData,
          pagination,
        });
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
