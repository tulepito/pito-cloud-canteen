import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { PlanListing, WithFlexSDKData } from '@src/types';
import { EParticipantOrderStatus } from '@src/utils/enums';

export interface POSTRemindMemberBody {
  description: string;
  uniqueMemberIdList?: string[];
  planId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { description, uniqueMemberIdList, planId } =
      req.body as POSTRemindMemberBody;

    const { orderId } = req.query;
    let _uniqueMemberIdList = uniqueMemberIdList;

    if (!_uniqueMemberIdList?.length) {
      const integrationSdk = getIntegrationSdk();
      const planListingResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.show({ id: planId });

      const orderDetail =
        planListingResponse.data?.data.attributes?.metadata?.orderDetail;

      _uniqueMemberIdList = Object.values(orderDetail || {}).reduce(
        (acc, currentDateOrders) => {
          if (!currentDateOrders) {
            return acc;
          }

          const { memberOrders } = currentDateOrders;
          const memberIds = Object.entries(memberOrders || {}).reduce(
            (ids: string[], [memberId, orders]) => {
              if (!orders) return ids;

              const { foodId, status } = orders;

              if (
                (foodId === '' &&
                  status !== EParticipantOrderStatus.notAllowed) ||
                status === EParticipantOrderStatus.empty ||
                status === EParticipantOrderStatus.notJoined
              ) {
                return [...ids, memberId];
              }

              return ids;
            },
            [],
          );

          return [...acc, ...memberIds];
        },
        [] as string[],
      );
    }

    _uniqueMemberIdList = Array.from(new Set(_uniqueMemberIdList));

    await Promise.all(
      (_uniqueMemberIdList || []).map(async (participantId: string) => {
        await emailSendingFactory(
          EmailTemplateTypes.PARTICIPANT.PARTICIPANT_ORDER_PICKING,
          {
            orderId,
            participantId,
            bookerNote: description,
          },
        );
      }),
    );

    res.status(200).json({
      statusCode: 200,
      message: `Gửi email nhắc nhở thành công cho ${_uniqueMemberIdList?.length} người`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(handler);
