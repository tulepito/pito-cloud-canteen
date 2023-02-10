import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';
import get from 'lodash/get';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();

  const apiMethod = req.method;
  switch (apiMethod) {
    case 'GET':
      break;
    case 'POST':
      try {
        const {
          query: { orderId = '' },
          body: {
            email = '',
            companyId = '',
            planId = '',
            participants = [],
            orderDetail = {},
          },
        } = req;

        const user = denormalisedResponseEntities(
          await integrationSdk.users.show({
            email,
          }),
        )[0];

        if (!user) {
          res.json({
            statusCode: 401,
            message: `The email ${email} is not belong any account`,
          });
          return;
        }

        const userId = user?.id?.uuid;
        const isUserInCompany = get(
          user,
          'attributes.profile.metadata.companyList',
          [],
        ).includes(companyId);

        if (participants.includes(userId)) {
          res.json({
            statusCode: 400,
            message: `Participant is already in accessible list`,
          });
          return;
        }

        if (!isUserInCompany) {
          res.json({
            statusCode: 400,
            message: `Participant is not belong to company ${companyId}`,
          });
          return;
        }

        const newOrderDetail = Object.entries(orderDetail).reduce(
          (result, current) => {
            const [date, orderDetailOnDate] = current;
            const { memberOrders } = orderDetailOnDate as TObject;

            return {
              ...result,
              [date]: {
                ...(orderDetailOnDate as TObject),
                memberOrders: {
                  ...memberOrders,
                  [userId]: {
                    foodId: '',
                    status: EParticipantOrderStatus.empty,
                  },
                },
              },
            };
          },
          {},
        );

        await integrationSdk.listings.update({
          id: orderId,
          metadata: {
            participants: [...participants, userId],
          },
        });

        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail: newOrderDetail,
          },
        });

        res.status(200).json({
          statusCode: 200,
          message: `Successfully add participant, email: ${email}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'PUT':
      break;
    case 'DELETE':
      try {
        const {
          query: { orderId = '' },
          body: {
            planId = '',
            participantId = '',
            participants,
            newOrderDetail = {},
          },
        } = req;

        if (participants) {
          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              participants,
            },
          });
        }
        if (planId?.length > 0) {
          await integrationSdk.listings.update({
            id: planId,
            metadata: {
              orderDetail: newOrderDetail,
            },
          });
        }

        res.json({
          statusCode: 200,
          message: `Successfully delete participant, participantId: ${participantId}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    default:
      break;
  }
}

export default cookies(handler);
