import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import type { TMemberPlan } from '@redux/slices/shoppingCart.slice';
import cookies from '@services/cookie';
import participantChecker from '@services/permissionChecker/participant';
import { createSlackNotification } from '@services/slackNotification';
import { ESlackNotificationType } from '@src/utils/enums';
import {
  FailedResponse,
  HttpStatus,
  SuccessResponse,
} from '@src/utils/response';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST: {
      try {
        const { orderId } = req.query;
        const { planId, userOrder, userEmail, error } = req.body as {
          planId: string;
          userOrder: TMemberPlan;
          userEmail: string;
          error: string;
        };

        await createSlackNotification(
          ESlackNotificationType.PARTICIPANT_PLACE_ORDER_FAILED,
          {
            participantPlaceOrderFailedData: {
              orderId: orderId as string,
              planId,
              userOrder,
              error,
              userEmail,
            },
          },
        );

        return new SuccessResponse({
          message: 'Sucess send notification to slack',
        }).send(res);
      } catch (error) {
        return new FailedResponse({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send notification to slack',
          error: error as string,
        }).send(res);
      }
    }
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default cookies(participantChecker(handler));
