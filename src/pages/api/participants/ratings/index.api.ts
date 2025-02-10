import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import logger from '@helpers/logger';
import {
  postParticipantRatingFn,
  updateRatingForRestaurantFn,
} from '@pages/api/apiServices/company/rating.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotificationToPartner } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk, handleError } from '@services/sdk';
import type {
  OrderListing,
  PlanListing,
  UserListing,
  WithFlexSDKData,
} from '@src/types';
import { Listing } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import {
  ENativeNotificationType,
  ENotificationType,
  ESubOrderTxStatus,
} from '@src/utils/enums';

import {
  addFirebaseDocument,
  buildParticipantSubOrderDocumentId,
  updateFirebaseDocument,
} from '../document/document.service';

export interface POSTParticipantRating {
  companyName: string;
  rating: {
    reviewerId: string;
    timestamp: string;
    generalRating: number;
    detailRating: {
      food: {
        rating: number;
      };
      packaging: {
        rating: number;
      };
    };
  };
  detailTextRating: string;
  imageIdList: string[];
  imageUrlList: string[];
  planId: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const {
          companyName,
          rating,
          detailTextRating,
          imageIdList,
          imageUrlList,
          planId,
        } = req.body as POSTParticipantRating;
        const sdk = getSdk(req, res);

        const currentUser: WithFlexSDKData<UserListing> =
          await sdk.currentUser.show();

        const { reviewerId, timestamp, generalRating, detailRating } = rating;
        const plan: PlanListing = await fetchListing(planId);
        const planListing = Listing(plan as any);
        const { orderDetail = {} } = planListing.getMetadata();
        const { foodId } =
          orderDetail[timestamp]?.memberOrders?.[reviewerId] || {};
        const food = await fetchListing(foodId, ['author']);
        const foodListing = Listing(food);
        const { title: foodName } = foodListing.getAttributes();

        if (!plan.attributes?.metadata?.orderId) {
          throw new Error('Order id not found');
        }

        const orderListing: OrderListing = await fetchListing(
          plan.attributes?.metadata?.orderId,
        );

        if (!orderListing.attributes?.title) {
          throw new Error('Order title not found');
        }

        const review = await postParticipantRatingFn({
          companyName,
          rating,
          detailTextRating,
          imageIdList,
          foodName,
          foodId,
          imageUrlList,
          orderCode: orderListing.attributes?.title,
          ratingUserName: buildFullName(
            currentUser.data.data.attributes?.profile?.firstName,
            currentUser.data.data.attributes?.profile?.lastName,
            {
              compareToGetLongerWith:
                currentUser.data.data.attributes?.profile?.displayName,
            },
          ),
        });

        await updateRatingForRestaurantFn([rating]);

        const subOrderId = buildParticipantSubOrderDocumentId(
          reviewerId,
          planId,
          +timestamp,
        );

        try {
          await updateFirebaseDocument(subOrderId, {
            reviewId: review.id.uuid,
            txStatus: ESubOrderTxStatus.DELIVERED, // mark the document as delivered, to perform the fetch action
          });
        } catch (error) {
          const errorString = String(error);
          if (errorString.includes('NOT_FOUND')) {
            await addFirebaseDocument({
              participantId: reviewerId,
              planId,
              timestamp: +timestamp,
              extraParams: {
                reviewId: review.id.uuid,
                txStatus: ESubOrderTxStatus.DELIVERED,
              },
            });
          }
        }

        createFirebaseDocNotification(ENotificationType.ORDER_RATING, {
          userId: reviewerId,
          planId,
          subOrderDate: +timestamp,
          foodName,
        });

        if (
          generalRating <= 2 ||
          (detailRating?.food.rating && detailRating?.food.rating <= 2) ||
          (detailRating?.packaging.rating &&
            detailRating?.packaging.rating <= 2)
        ) {
          createNativeNotificationToPartner(
            ENativeNotificationType.PartnerSubOrderNegativeRating,
            {
              partner: food.author,
              subOrderDate: timestamp,
            },
          );
        }
        res.status(200).json({ success: true });
      } catch (error) {
        logger.error('Error in POST /api/participants/ratings', String(error));
        handleError(res, error);
      }

      break;

    default:
      break;
  }
}

export default cookies(participantChecker(handler));
