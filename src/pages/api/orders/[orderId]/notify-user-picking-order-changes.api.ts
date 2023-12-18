import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import orderServices from '@pages/api/apiServices/order/index.service';
import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { CurrentUser } from '@src/utils/data';
import type { TObject, TOrderChangeHistoryItem } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const {
      userRoles = [],
      emailParamsForParticipantNotification,
      emailParamsForBookerNotification,
      firebaseChangeHistory,
    } = req.body;
    const { currentUser } = req.previewData as any;

    switch (apiMethod) {
      case HttpMethod.POST: {
        if (userRoles.includes('booker')) {
          emailSendingFactory(
            EmailTemplateTypes.BOOKER.BOOKER_PICKING_ORDER_CHANGED,
            emailParamsForBookerNotification,
          );
        }

        if (userRoles.includes('participant')) {
          emailParamsForParticipantNotification.forEach((params: TObject) =>
            emailSendingFactory(
              EmailTemplateTypes.PARTICIPANT.PARTICIPANT_PICKING_ORDER_CHANGED,
              params,
            ),
          );
        }

        if (!isEmpty(firebaseChangeHistory)) {
          firebaseChangeHistory.forEach(
            async (data: Partial<TOrderChangeHistoryItem>) => {
              try {
                await orderServices.createOrderHistoryRecordToFirestore({
                  authorId: CurrentUser(currentUser).getId(),
                  ...data,
                } as TOrderChangeHistoryItem);
              } catch (error: any) {
                throw new Error(error);
              }
            },
          );
        }

        return res.status(200).json('Successfully notify user');
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
