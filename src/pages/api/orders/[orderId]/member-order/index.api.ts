import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { convertDateToVNTimezone } from '@helpers/dateHelpers';
import { denormalisedResponseEntities } from '@services/data';
import { fetchListing, fetchUserListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import type {
  FoodListing,
  OrderListing,
  PlanListing,
  WithFlexSDKData,
} from '@src/types';
import { Listing } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { EOrderStates, ESlackNotificationType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import { normalizeOrderDetail } from '../../utils';
import type { DifferentOrderDetail } from '../update-order-detail-from-draft.api';

const mappingOrderDetailsToOrderAndTransaction = async (
  planListing: TListing,
  anonymous: string[] = [],
) => {
  const integrationSdk = getIntegrationSdk();

  const planId = Listing(planListing).getId();
  const { orderId, orderDetail } = Listing(planListing).getMetadata();

  const orderResponse = await integrationSdk.listings.show({
    id: orderId,
  });

  const [orderListing] = denormalisedResponseEntities(orderResponse);

  const { deliveryHour, anonymous: currAnonymous = [] } =
    Listing(orderListing).getMetadata();
  const normalizedOrderDetail = normalizeOrderDetail({
    orderId,
    planId,
    planOrderDetail: orderDetail,
    deliveryHour,
  });

  const memberIds = uniq(
    Object.entries(orderDetail).reduce<string[]>(
      (idList, [_key, currentOrderOfDate]) => {
        const { memberOrders = {} } = (currentOrderOfDate as TObject) || {};

        return idList.concat(Object.keys(memberOrders as TObject));
      },
      [],
    ),
  );
  const shouldNormalizeAnonymousList = isEmpty(anonymous)
    ? currAnonymous
    : anonymous;
  const updateAnonymousList = shouldNormalizeAnonymousList.filter(
    (id: string) => memberIds.includes(id),
  );
  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      anonymous: updateAnonymousList,
    },
  });

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
};

const sendParticipantFoodChangeSlackNotification = async (
  orderListing: OrderListing,
  newMembersOrderValues: NewMembersOrderValues,
  currentDate: number,
) => {
  const diffentOrderDetail = await Object.keys(
    newMembersOrderValues || {},
  ).reduce<Promise<DifferentOrderDetail>>(async (_acc, memberId) => {
    const acc = await _acc;

    const { foodId, status } = newMembersOrderValues[memberId];

    const member = await fetchUserListing(memberId);
    const integrationSdk = getIntegrationSdk();
    const foodListing: WithFlexSDKData<FoodListing> =
      await integrationSdk.listings.show({
        id: foodId,
      });

    if (status === 'joined') {
      return {
        ...acc,
        [currentDate]: {
          memberOrders: {
            ...acc[currentDate]?.memberOrders,
            [memberId]: {
              newFoodId: foodId,
              newFoodName: foodListing.data.data.attributes?.title,
              memberName: buildFullName(
                member?.attributes?.profile?.firstName,
                member?.attributes?.profile?.lastName,
                {
                  compareToGetLongerWith:
                    member?.attributes?.profile?.displayName,
                },
              ),
            },
          },
        },
      };
    }

    return acc;
  }, Promise.resolve({}));

  createSlackNotification(
    ESlackNotificationType.PARTICIPANT_GROUP_ORDER_FOOD_CHANGED,
    {
      participantNormalOrderFoodChangedData: {
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
              const { oldFoodName, newFoodName, memberName } =
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
              };
            });
          })
          .reduce((acc, memberOrders) => [...acc, ...memberOrders], []),
      },
    },
  );
};

type NewMembersOrderValues = {
  [memberId: string]: {
    foodId: string;
    requirement: string;
    status: 'joined';
  };
};

export interface PUTMemberOrderBody {
  planId: string;
  currentViewDate: number;
  participantId?: string;
  newMemberOrderValues?: unknown;
  newMembersOrderValues: NewMembersOrderValues;
  anonymous?: string[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HttpMethod.PUT:
      try {
        const {
          planId,
          currentViewDate,
          participantId,
          newMemberOrderValues,
          newMembersOrderValues,
          anonymous = [],
        } = req.body as PUTMemberOrderBody;

        const currentPlan: PlanListing = await fetchListing(planId);
        const currentPlanListing = Listing(currentPlan as TListing);
        const { orderDetail = {} } = currentPlanListing.getMetadata();

        const orderListing: WithFlexSDKData<OrderListing> =
          await integrationSdk.listings.show({
            id: currentPlan.attributes?.metadata?.orderId,
          });

        const newOrderDetail = {
          ...orderDetail,
          [currentViewDate]: {
            ...orderDetail[currentViewDate],
            memberOrders: {
              ...orderDetail[currentViewDate].memberOrders,
              ...(newMembersOrderValues && {
                ...newMembersOrderValues,
              }),
              ...(participantId && {
                [participantId]: newMemberOrderValues,
              }),
            },
          },
        };

        const response = await integrationSdk.listings.update(
          {
            id: planId,
            metadata: {
              orderDetail: newOrderDetail,
            },
          },
          { expand: true },
        );

        const [planListing] = denormalisedResponseEntities(response);

        if (
          orderListing.data.data.attributes?.metadata?.orderState ===
          EOrderStates.inProgress
        ) {
          sendParticipantFoodChangeSlackNotification(
            orderListing.data.data,
            newMembersOrderValues,
            currentViewDate,
          );
        }

        // Update order and transaction metadata without waiting for response
        mappingOrderDetailsToOrderAndTransaction(planListing, anonymous);

        res.json({
          statusCode: 200,
          message: `Successfully update plan info, planId: ${planId}`,
          planListing,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;

    default:
      break;
  }
};

export default handler;
