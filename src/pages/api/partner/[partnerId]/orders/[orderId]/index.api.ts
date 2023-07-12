import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { orderId, JSONParams } = req.query;
    const { date } = JSON.parse(JSONParams as string);

    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    if (isEmpty(date) || isEmpty(orderId)) {
      return res
        .status(EHttpStatusCode.BadRequest)
        .json({ error: 'Missing order date or order ID' });
    }

    switch (apiMethod) {
      case HttpMethod.GET: {
        const [order] = denormalisedResponseEntities(
          (await integrationSdk.listings.show({ id: orderId })) || [{}],
        );
        const {
          plans = [],
          companyId,
          participants = [],
          anonymous = [],
          orderType = EOrderType.group,
        } = Listing(order).getMetadata();
        const planId = plans[0];
        const isGroupOrder = EOrderType.group === orderType;
        let orderWithPlanDataMaybe = { ...order };

        if (isGroupOrder) {
          if (!isEmpty(participants)) {
            const participantData = await Promise.all(
              participants.map(async (id: string) => {
                const [memberAccount] = denormalisedResponseEntities(
                  await integrationSdk.users.show({
                    id,
                  }),
                );

                return memberAccount;
              }),
            );
            orderWithPlanDataMaybe = {
              ...orderWithPlanDataMaybe,
              participants: participantData,
            };
          }
          if (!isEmpty(anonymous)) {
            const anonymousParticipantData = await Promise.all(
              anonymous.map(async (id: string) => {
                const [memberAccount] = denormalisedResponseEntities(
                  await integrationSdk.users.show({
                    id,
                  }),
                );

                return memberAccount;
              }),
            );
            orderWithPlanDataMaybe = {
              ...orderWithPlanDataMaybe,
              anonymous: anonymousParticipantData,
            };
          }
        }

        // TODO: query company info
        const companyResponse = await integrationSdk.users.show({
          id: companyId,
        });
        const [company] = denormalisedResponseEntities(companyResponse);

        if (!isEmpty(company)) {
          orderWithPlanDataMaybe = { ...orderWithPlanDataMaybe, company };
        }

        if (planId) {
          // TODO: query plan info
          const [planListing] = denormalisedResponseEntities(
            (await integrationSdk.listings.show({ id: planId })) || [{}],
          );

          if (isEmpty(planListing)) {
            return res
              .status(EHttpStatusCode.NotFound)
              .json({ error: 'Order detail was not found' });
          }

          const { orderDetail = {} } = Listing(planListing).getMetadata();
          const orderDetailOfDate = orderDetail[date];

          // TODO: query tx info
          const txId = orderDetailOfDate?.transactionId;
          if (isEmpty(txId)) {
            return res
              .status(EHttpStatusCode.BadRequest)
              .json({ error: 'Invalid order date' });
          }

          const [transaction] = denormalisedResponseEntities(
            (await integrationSdk.transactions.show({
              id: txId,
            })) || [{}],
          );

          orderWithPlanDataMaybe = {
            ...orderWithPlanDataMaybe,
            plan: planListing,
            transaction,
          };
        }

        return res.status(200).json(orderWithPlanDataMaybe);
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
