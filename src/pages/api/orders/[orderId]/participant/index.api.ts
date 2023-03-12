import get from 'lodash/get';
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
            companyId = '',
            planId = '',
            participants = [],
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
        const isUserInCompany = get(
          user,
          'attributes.profile.metadata.companyList',
          [],
        ).includes(companyId);

        if (participants.includes(userId)) {
          res.json({
            errorCode: 'user_already_in_list',
            message: `Đã tồn tại trong danh sách thành viên`,
          });
          return;
        }

        if (!isUserInCompany) {
          res.json({
            errorCode: 'user_not_belong_to_company',
            message: `Thanh viên không thuộc công ty`,
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
