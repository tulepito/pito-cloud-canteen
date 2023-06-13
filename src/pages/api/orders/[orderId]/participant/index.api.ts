import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();

  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const {
          query: { orderId = '' },
          body: {
            email = '',
            planId = '',
            participants = [],
            anonymous = [],
            orderDetail = {},
          },
        } = req;

        let user;

        try {
          [user] = denormalisedResponseEntities(
            await integrationSdk.users.show({
              email,
            }),
          );
        } catch (errorFetchUser: any) {
          console.error(errorFetchUser?.data?.errors[0]);
        }

        if (!user) {
          res.json({
            errorCode: 'user_not_found',
            message: `Email ${email} chưa có tài khoản`,
          });

          return;
        }

        const userId = user?.id?.uuid;

        if (participants.includes(userId)) {
          res.json({
            errorCode: 'user_already_in_list',
            message: `Đã tồn tại trong danh sách thành viên`,
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

        const updateAnonymousList = anonymous?.includes(userId)
          ? anonymous?.splice(
              anonymous.findIndex((id: string) => userId === id),
              1,
            )
          : anonymous;

        await integrationSdk.listings.update({
          id: orderId,
          metadata: {
            participants: [...participants, userId],
            anonymous: updateAnonymousList,
          },
        });

        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail: newOrderDetail,
          },
        });

        res.status(200).json({
          message: `Successfully add participant, email: ${email}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.DELETE:
      try {
        const {
          query: { orderId = '' },
          body: {
            planId,
            participantId = '',
            participants = [],
            newOrderDetail = {},
          },
        } = req;

        if (!isEmpty(participants)) {
          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              participants,
            },
          });
        }

        if (!isEmpty(planId)) {
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
