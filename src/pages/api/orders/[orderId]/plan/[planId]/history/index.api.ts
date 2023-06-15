import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import orderServices from '@pages/api/apiServices/order/index.service';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import { CurrentUser } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.POST: {
        try {
          const sdk = getSdk(req, res);
          const { planId } = req.query;
          const createData = req.body;
          const currentUser = denormalisedResponseEntities(
            await sdk.currentUser.show(),
          )[0];
          const response =
            await orderServices.createSubOrderHistoryRecordToFirestore({
              planId,
              createdAt: new Date(),
              authorId: CurrentUser(currentUser).getId(),
              ...createData,
            });

          return res.status(200).json(response);
        } catch (error) {
          return res.status(500).json(error);
        }
      }
      case HttpMethod.GET: {
        try {
          const integrationSdk = getIntegrationSdk();
          const {
            planId,
            planOrderDate,
            limitRecords = 3,
            lastRecordCreatedAt,
          } = req.query;

          const results = await orderServices.querySubOrderHistoryFromFirebase({
            planId: planId as string,
            planOrderDate: Number(planOrderDate),
            limitRecords: Number(limitRecords),
            lastRecord: Number(lastRecordCreatedAt),
          });

          const collectionCount = await orderServices.getSubOrderHistoryCount({
            planId: planId as string,
            planOrderDate: Number(planOrderDate),
          });

          const response = await Promise.all(
            results.map(async (item) => {
              const [member] = denormalisedResponseEntities(
                await integrationSdk.users.show({
                  id: item.memberId,
                }),
              );

              return { ...item, member };
            }),
          );

          return res.status(200).json({
            data: response,
            totalItems: collectionCount,
          });
        } catch (error) {
          console.error(error);

          return res.status(500).json(error);
        }
      }
      case HttpMethod.DELETE:
      case HttpMethod.PUT:
      default:
        return res.status(404).json('Method is not allowed');
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
