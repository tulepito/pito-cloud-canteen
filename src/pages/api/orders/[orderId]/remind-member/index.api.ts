import type { NextApiRequest, NextApiResponse } from 'next';
import pLimit from 'p-limit';
import pRetry from 'p-retry';

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

// Utility
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
};

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
          if (!currentDateOrders) return acc;

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

    if (!_uniqueMemberIdList.length) {
      return res.status(200).json({
        statusCode: 200,
        message: 'Không có người dùng nào cần gửi email nhắc nhở',
        results: { successful: 0, failed: 0, total: 0 },
      });
    }

    // ==== CONFIG HERE ====
    const CONCURRENCY = 10; // Gửi đồng thời 10 email
    const BATCH_DELAY = 400; // Delay 400ms giữa mỗi batch
    const limit = pLimit(CONCURRENCY);
    // ======================

    const results: { successful: number; failed: number; errors: string[] } = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    const batches = chunkArray(_uniqueMemberIdList, CONCURRENCY);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        batch.map((participantId) =>
          limit(() =>
            pRetry(
              () =>
                emailSendingFactory(
                  EmailTemplateTypes.PARTICIPANT.PARTICIPANT_ORDER_PICKING,
                  { orderId, participantId, bookerNote: description },
                ),
              {
                retries: 3,
                minTimeout: 1000,
                maxTimeout: 3000,
                onFailedAttempt: (error: {
                  attemptNumber: any;
                  message: any;
                }) => {
                  console.log(
                    `Retry ${error.attemptNumber} for ${participantId}: ${error.message}`,
                  );
                },
              },
            )
              .then(() => {
                results.successful++;
                console.log(`✓ Gửi thành công cho ${participantId}`);
              })
              .catch((error: { message: any }) => {
                results.failed++;
                results.errors.push(`${participantId}: ${error.message}`);
                console.error(
                  `✗ Gửi thất bại cho ${participantId}:`,
                  error.message,
                );
              }),
          ),
        ),
      );

      if (i < batches.length - 1) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(BATCH_DELAY);
      }
    }

    const response = {
      statusCode: results.failed > 0 ? 207 : 200,
      message: `Đã gửi thành công ${results.successful}/${_uniqueMemberIdList.length} email nhắc nhở`,
      results: {
        successful: results.successful,
        failed: results.failed,
        total: _uniqueMemberIdList.length,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
    };

    res.status(response.statusCode).json(response);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(handler);
