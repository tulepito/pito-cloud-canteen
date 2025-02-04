import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { convertDateToVNTimezone } from '@helpers/dateHelpers';
import logger from '@helpers/logger';
import { pushNotificationOrderDetailChanged } from '@pages/api/helpers/orderDetailHelper';
import { denormalisedResponseEntities } from '@services/data';
import { fetchUserListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import type {
  FoodListing,
  OrderDetail,
  OrderListing,
  PlanListing,
  WithFlexSDKData,
} from '@src/types';
import { Listing } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import {
  EOrderStates,
  EOrderType,
  ESlackNotificationType,
} from '@src/utils/enums';

import { normalizeOrderDetail } from '../utils';

type DifferentOrderDetailMember = {
  oldFoodId?: string;
  oldFoodName?: string;
  newFoodId?: string;
  newFoodName?: string;
  memberName: string;
  restaurantName: string;
};

type DifferentOrderDetailLineItem = {
  foodId?: string;
  foodName?: string;
  oldQuantity?: number;
  newQuantity?: number;
};

type DifferentOrderDetailValue = {
  memberOrders?: {
    [memberId: string]: DifferentOrderDetailMember;
  };
  lineItems?: DifferentOrderDetailLineItem[];
};

export type DifferentOrderDetail = {
  [date: string]: DifferentOrderDetailValue;
};

const sendParticipantChangedGroupOrderFoodsSlackNotification = async (
  orderListing: OrderListing,
  planListing: PlanListing,
  newOrderDetail: OrderDetail,
  oldOrderDetail: OrderDetail,
  by: 'admin' | 'booker',
) => {
  const diffentOrderDetail = await Object.keys(newOrderDetail).reduce(
    async (accPromise, date) => {
      const acc = await accPromise;
      const newMemberOrders = newOrderDetail[date]?.memberOrders;
      const oldMemberOrders = oldOrderDetail[date]?.memberOrders;
      const restaurantName =
        newOrderDetail[date]?.restaurant?.restaurantName || '';

      const differentMemberOrders = await Object.keys(
        newMemberOrders || {},
      ).reduce(
        async (_memberAcc, memberId) => {
          const memberAcc = await _memberAcc;

          const member = await fetchUserListing(memberId);

          if (
            newMemberOrders?.[memberId]?.foodId !==
            oldMemberOrders?.[memberId]?.foodId
          ) {
            return {
              ...memberAcc,
              [memberId]: {
                oldFoodId: oldMemberOrders?.[memberId]?.foodId,
                newFoodId: newMemberOrders?.[memberId]?.foodId,
                restaurantName,
                memberName: buildFullName(
                  member?.attributes?.profile?.firstName,
                  member?.attributes?.profile?.lastName,
                  {
                    compareToGetLongerWith:
                      member?.attributes?.profile?.displayName,
                  },
                ),
              },
            };
          }

          if (
            newMemberOrders?.[memberId]?.status === 'notAllowed' &&
            oldMemberOrders?.[memberId]?.status !== 'notAllowed'
          ) {
            return {
              ...memberAcc,
              [memberId]: {
                oldFoodId: oldMemberOrders?.[memberId]?.foodId,
                newFoodId: undefined,
                restaurantName,
                memberName: buildFullName(
                  member?.attributes?.profile?.firstName,
                  member?.attributes?.profile?.lastName,
                  {
                    compareToGetLongerWith:
                      member?.attributes?.profile?.displayName,
                  },
                ),
              },
            };
          }

          if (
            oldMemberOrders?.[memberId]?.status === 'notAllowed' &&
            newMemberOrders?.[memberId]?.status !== 'notAllowed'
          ) {
            return {
              ...memberAcc,
              [memberId]: {
                oldFoodId: undefined,
                newFoodId: newMemberOrders?.[memberId]?.foodId,
                restaurantName,
                memberName: buildFullName(
                  member?.attributes?.profile?.firstName,
                  member?.attributes?.profile?.lastName,
                  {
                    compareToGetLongerWith:
                      member?.attributes?.profile?.displayName,
                  },
                ),
              },
            };
          }

          return memberAcc;
        },
        Promise.resolve({}) as Promise<{
          [memberId: string]: DifferentOrderDetailMember;
        }>,
      );

      if (Object.keys(differentMemberOrders).length) {
        const distinctFoodIds = Object.values(differentMemberOrders).reduce(
          (foodIds, { oldFoodId, newFoodId }) => {
            if (oldFoodId && !foodIds.includes(oldFoodId)) {
              foodIds = [...foodIds, oldFoodId];
            }

            if (newFoodId && !foodIds.includes(newFoodId)) {
              foodIds = [...foodIds, newFoodId];
            }

            return foodIds;
          },
          [] as string[],
        );

        const integrationSdk = getIntegrationSdk();
        const foodListings: WithFlexSDKData<FoodListing[]> =
          await integrationSdk.listings.query({
            ids: distinctFoodIds,
          });

        const foodNameMap = foodListings.data.data.reduce(
          (accFoodNameMap, foodListing) =>
            foodListing.id?.uuid
              ? {
                  ...accFoodNameMap,
                  [foodListing.id.uuid]: foodListing.attributes?.title || '',
                }
              : accFoodNameMap,
          {} as {
            [foodId: string]: string;
          },
        );

        const memberOrders = Object.keys(differentMemberOrders).reduce(
          (memberAcc, memberId) => {
            const { oldFoodId, newFoodId, memberName } =
              differentMemberOrders[memberId];

            return {
              ...memberAcc,
              [memberId]: {
                oldFoodId,
                oldFoodName: oldFoodId ? foodNameMap[oldFoodId] : undefined,
                newFoodId,
                newFoodName: newFoodId ? foodNameMap[newFoodId] : undefined,
                memberName,
                restaurantName,
              },
            };
          },
          {} as {
            [memberId: string]: DifferentOrderDetailMember;
          },
        );

        return {
          ...acc,
          [date]: {
            memberOrders,
          },
        };
      }

      return acc;
    },
    Promise.resolve({}) as Promise<DifferentOrderDetail>,
  );

  createSlackNotification(
    ESlackNotificationType.PARTICIPANT_GROUP_ORDER_FOOD_CHANGED,
    {
      participantGroupOrderFoodChangedData: {
        by,
        threadTs: planListing.attributes?.metadata?.slackThreadTs!,
        orderCode: orderListing.attributes?.title!,
        orderLink: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/admin/order/${orderListing.id?.uuid}`,
        orderName: orderListing.attributes?.publicData?.orderName!,
        changes: Object.keys(diffentOrderDetail)
          .map((date) => {
            const { memberOrders } = diffentOrderDetail[date];

            if (!memberOrders) {
              return [];
            }

            return Object.keys(memberOrders).map((memberId) => {
              const { oldFoodName, newFoodName, memberName, restaurantName } =
                memberOrders[memberId];
              const type =
                (!oldFoodName && newFoodName && ('add' as const)) ||
                (!newFoodName && oldFoodName && ('remove' as const)) ||
                ('update' as const);

              return {
                participantName: memberName,
                date: convertDateToVNTimezone(new Date(+date)).split('T')[0],
                type,
                fromFoodName: oldFoodName,
                toFoodName: newFoodName,
                addFoodName: newFoodName,
                removeFoodName: oldFoodName,
                restaurantName,
              };
            });
          })
          .reduce((acc, memberOrders) => [...acc, ...memberOrders], []),
      },
    },
  );
};

const sendParticipantChangedNormalOrderFoodsSlackNotification = async (
  orderListing: OrderListing,
  planListing: PlanListing,
  newOrderDetail: OrderDetail,
  oldOrderDetail: OrderDetail,
  by: 'admin' | 'booker',
) => {
  const diffentOrderDetail = Object.keys(newOrderDetail).reduce((acc, date) => {
    const newLineItems = newOrderDetail[date]?.lineItems;
    const oldLineItems = oldOrderDetail[date]?.lineItems;

    const removedLineItems = oldLineItems?.filter(
      (_lineItem) =>
        !newLineItems?.some((newLineItem) => newLineItem?.id === _lineItem?.id),
    );

    const addedLineItems = newLineItems?.filter(
      (_lineItem) =>
        !oldLineItems?.some((oldLineItem) => oldLineItem?.id === _lineItem?.id),
    );

    const updatedLineItems = newLineItems?.filter((_lineItem) =>
      oldLineItems?.some(
        (oldLineItem) =>
          oldLineItem?.id === _lineItem?.id &&
          oldLineItem?.quantity !== _lineItem?.quantity,
      ),
    );

    const changes = [
      ...(removedLineItems || []).map((lineItem) => ({
        foodId: lineItem?.id,
        foodName: lineItem?.name,
        oldQuantity: lineItem?.quantity,
        newQuantity: 0,
      })),
      ...(addedLineItems || []).map((lineItem) => ({
        foodId: lineItem?.id,
        foodName: lineItem?.name,
        oldQuantity: 0,
        newQuantity: lineItem?.quantity,
      })),
      ...(updatedLineItems || []).map((lineItem) => ({
        foodId: lineItem?.id,
        foodName: lineItem?.name,
        oldQuantity: oldLineItems?.find(
          (oldLineItem) => oldLineItem?.id === lineItem?.id,
        )?.quantity,
        newQuantity: lineItem?.quantity,
      })),
    ];

    return {
      ...acc,
      [date]: {
        lineItems: changes,
      },
    };
  }, {} as DifferentOrderDetail);

  createSlackNotification(
    ESlackNotificationType.PARTICIPANT_NORMAL_ORDER_FOOD_CHANGED,
    {
      participantNormalOrderFoodChangedData: {
        by,
        threadTs: planListing.attributes?.metadata?.slackThreadTs!,
        orderCode: orderListing.attributes?.title!,
        orderLink: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/admin/order/${orderListing.id?.uuid}`,
        orderName: orderListing.attributes?.publicData?.orderName!,
        changes: Object.keys(diffentOrderDetail)
          .map((date) => {
            const { lineItems } = diffentOrderDetail[date];

            if (!lineItems) {
              return [];
            }

            return lineItems.map((lineItem) => {
              const { foodName, oldQuantity, newQuantity } = lineItem;
              const type =
                (!oldQuantity && newQuantity && ('add' as const)) ||
                (!newQuantity && oldQuantity && ('remove' as const)) ||
                ('update' as const);

              return {
                foodName,
                type,
                fromQuantity: oldQuantity,
                toQuantity: newQuantity,
                date: convertDateToVNTimezone(new Date(+date)).split('T')[0],
              };
            });
          })
          .reduce((acc, lineItems) => [...acc, ...lineItems], []),
      },
    },
  );
};

export interface PUTUpdateOrderDetailFromDraftBody {
  planId: string;
  orderDetail: OrderDetail;
  isAdminFlow: boolean;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HttpMethod.PUT:
      try {
        const { planId, orderDetail, isAdminFlow } =
          req.body as PUTUpdateOrderDetailFromDraftBody;
        const { orderId } = req.query;

        const oldPlanListing: WithFlexSDKData<PlanListing> =
          await integrationSdk.listings.show({
            id: planId,
          });

        const oldOrderDetail =
          oldPlanListing.data.data.attributes?.metadata?.orderDetail;

        if (!oldOrderDetail) {
          throw new Error('Old order detail is not found');
        }

        const orderListingResponse: WithFlexSDKData<OrderListing> =
          await integrationSdk.listings.show({
            id: orderId,
          });

        const planListingResponse: WithFlexSDKData<PlanListing> =
          await integrationSdk.listings.update({
            id: planId,
            metadata: {
              orderDetail,
            },
          });

        const orderListing =
          denormalisedResponseEntities(orderListingResponse)[0];

        const { deliveryHour, orderState } =
          Listing(orderListing).getMetadata();

        const normalizedOrderDetail = normalizeOrderDetail({
          orderId: orderId as string,
          planId,
          planOrderDetail: orderDetail as any,
          deliveryHour,
        });

        if (orderState === EOrderStates.inProgress) {
          const orderType =
            orderListingResponse.data.data.attributes?.metadata?.orderType;

          if (orderType === EOrderType.group) {
            sendParticipantChangedGroupOrderFoodsSlackNotification(
              orderListingResponse.data.data,
              oldPlanListing.data.data,
              orderDetail,
              oldOrderDetail,
              isAdminFlow ? 'admin' : 'booker',
            );
          }

          if (orderType === EOrderType.normal) {
            sendParticipantChangedNormalOrderFoodsSlackNotification(
              orderListingResponse.data.data,
              oldPlanListing.data.data,
              orderDetail,
              oldOrderDetail,
              isAdminFlow ? 'admin' : 'booker',
            );
          }
        }

        await Promise.all(
          normalizedOrderDetail.map(async (order, index) => {
            const { params } = order;
            const {
              transactionId,
              extendedData: { metadata },
            } = params;

            if (transactionId) {
              await integrationSdk.transactions.updateMetadata({
                id: transactionId,
                metadata: {
                  ...metadata,
                  isLastTxOfPlan: index === normalizedOrderDetail.length - 1,
                },
              });
            }
          }),
        );

        await pushNotificationOrderDetailChanged(
          orderDetail,
          oldOrderDetail,
          orderListing,
          integrationSdk,
        );

        res.json({
          statusCode: 200,
          message: `Successfully update plan from draft plan, planId: ${planId}`,
          planListing: denormalisedResponseEntities(planListingResponse)[0],
        });
      } catch (error) {
        logger.error(
          'Error when update order detail from draft:',
          String(error),
        );
        handleError(res, error);
      }
      break;

    default:
      break;
  }
};

export default handler;
