import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import type { TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const {
      userRoles = [],
      emailParamsForParticipantNotification,
      emailParamsForBookerNotification,
      // firebaseChangeHistory,
    } = req.body;

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

export default composeApiCheckers(adminChecker)(handler);
