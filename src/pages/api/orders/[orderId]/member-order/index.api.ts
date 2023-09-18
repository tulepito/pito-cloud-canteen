import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import { normalizeOrderDetail } from '../../utils';

const mappingOrderDetailsToOrderAndTransaction = async (
  planListing: TListing,
  anonymous: string[] = [],
) => {
  const integrationSdk = getIntegrationSdk();

  const planId = Listing(planListing).getId();
  const { orderId, orderDetail } = Listing(planListing).getMetadata();

  const orderResponse = await integrationSdk.listings.show(
    {
      id: orderId,
    },
    { expand: true },
  );

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
        } = req.body;

        const currentPlan = await fetchListing(planId);
        const currentPlanListing = Listing(currentPlan);
        const { orderDetail = {} } = currentPlanListing.getMetadata();

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
