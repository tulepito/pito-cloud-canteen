import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
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
            participants = [],
            planId = '',
            nonAccountEmails,
            anonymous = [],
            orderDetail = {},
            userIds: userIdsFromBody = [],
          },
        } = req;
        const needUpdateNoAccountEmails =
          typeof nonAccountEmails !== 'undefined';

        let userIds: string[] = [];

        if (isEmpty(userIdsFromBody) && !isEmpty(email)) {
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
            if (needUpdateNoAccountEmails) {
              // TODO: update participant list
              await integrationSdk.listings.update({
                id: orderId,
                metadata: {
                  nonAccountEmails,
                },
              });
            }

            res.json({
              errorCode: 'user_not_found',
              message: `Email ${email} chưa có tài khoản`,
            });

            return;
          }

          userIds.push(user?.id?.uuid);

          if (participants.includes(user?.id?.uuid)) {
            res.json({
              errorCode: 'user_already_in_list',
              message: `Đã tồn tại trong danh sách thành viên`,
            });

            return;
          }
        } else {
          userIds = userIdsFromBody;
        }

        // TODO: update participant list
        if (!isEmpty(userIds) || needUpdateNoAccountEmails) {
          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              ...(!isEmpty(userIds)
                ? {
                    participants: uniq(participants.concat(userIds)),
                    ...(isEmpty(anonymous)
                      ? {}
                      : { anonymous: difference(anonymous, userIds) }),
                  }
                : {}),
              ...(needUpdateNoAccountEmails ? { nonAccountEmails } : {}),
            },
          });
        }

        if (!isEmpty(planId)) {
          const newOrderDetail = Object.entries(orderDetail).reduce(
            (result, current) => {
              const [date, orderDetailOnDate] = current;
              const { memberOrders } = orderDetailOnDate as TObject;

              const newMemberOrders = userIds.reduce(
                (memberOrderRes, userId) => {
                  return {
                    [userId]: {
                      foodId: '',
                      status: EParticipantOrderStatus.empty,
                    },
                    ...memberOrderRes,
                  };
                },
                memberOrders,
              );

              return {
                ...result,
                [date]: {
                  ...(orderDetailOnDate as TObject),
                  memberOrders: newMemberOrders,
                },
              };
            },
            {},
          );

          await integrationSdk.listings.update({
            id: planId,
            metadata: {
              orderDetail: newOrderDetail,
            },
          });

          userIds.forEach(async (userId: string) =>
            emailSendingFactory(
              EmailTemplateTypes.PARTICIPANT.PARTICIPANT_ORDER_PICKING,
              {
                orderId,
                participantId: userId,
              },
            ),
          );
        }

        res.status(200).json({
          message: `Successfully add participant, email: ${email} and ids: ${userIds}`,
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

        await integrationSdk.listings.update({
          id: orderId,
          metadata: {
            participants,
          },
        });

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
