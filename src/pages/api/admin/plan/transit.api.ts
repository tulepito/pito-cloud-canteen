import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { CustomError, EHttpStatusCode } from '@apis/errors';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import {
  denormalisedResponseEntities,
  Listing,
  Transaction,
  User,
} from '@src/utils/data';
import { isTransactionsTransitionInvalidTransition } from '@src/utils/errors';
import { ETransition } from '@src/utils/transaction';
import type { TError } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const { txId, transition } = req.body;

    if (isEmpty(txId) || isEmpty(transition)) {
      return handleError(
        res,
        new CustomError(
          'Missing transaction ID or transition',
          EHttpStatusCode.BadRequest,
        ),
      );
    }

    if (!Object.values(ETransition).includes(transition)) {
      return handleError(
        res,
        new CustomError(
          `Invalid transition: ${transition}`,
          EHttpStatusCode.BadRequest,
        ),
      );
    }

    switch (apiMethod) {
      case HttpMethod.POST: {
        const txResponse = await integrationSdk.transactions.transition(
          {
            id: txId,
            transition,
            params: {},
          },
          { expand: true, include: ['booking', 'listing', 'provider'] },
        );

        const tx = denormalisedResponseEntities(txResponse)[0];
        if (transition === ETransition.OPERATOR_CANCEL_PLAN) {
          const txGetter = Transaction(tx);
          const { booking, listing, provider } = txGetter.getFullData();
          const { start } = booking;
          const { participantIds = [], orderId } = txGetter.getMetadata();
          await emailSendingFactory(
            EmailTemplateTypes.BOOKER.BOOKER_SUB_ORDER_CANCELED,
            {
              orderId,
              timestamp: start,
            },
          );
          await Promise.all(
            participantIds.map(async (participantId: string) => {
              await emailSendingFactory(
                EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED,
                {
                  orderId,
                  timestamp: start,
                  participantId,
                },
              );
            }),
          );
          const listingGetter = Listing(listing);
          const providerGetter = User(provider);
          const restaurantId = listingGetter.getId();
          const partnerId = providerGetter.getId();

          await emailSendingFactory(
            EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
            {
              orderId,
              timestamp: start,
              restaurantId,
              partnerId,
            },
          );
        }

        return res.status(200).json({
          message: 'Successfully transit transaction',
          tx,
        });
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);

    if (isTransactionsTransitionInvalidTransition(error as TError)) {
      handleError(
        res,
        new CustomError('Invalid transition', EHttpStatusCode.Conflict),
      );
    } else {
      handleError(res, error);
    }
  }
}

export default composeApiCheckers(adminChecker)(handler);
