import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { CustomError, EHttpStatusCode } from '@apis/errors';
import createQuotation from '@pages/api/orders/[orderId]/quotation/create-quotation.service';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import {
  denormalisedResponseEntities,
  Listing,
  Transaction,
} from '@src/utils/data';
import { VNTimezone } from '@src/utils/dates';
import { ENotificationType, EQuotationStatus } from '@src/utils/enums';
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
        const txGetter = Transaction(tx);
        const { participantIds = [], orderId } = txGetter.getMetadata();
        const { booking, listing } = txGetter.getFullData();
        const { displayStart } = booking.attributes;
        const timestamp = new Date(displayStart).getTime();
        const startTimestamp = DateTime.fromMillis(timestamp)
          .setZone(VNTimezone)
          .startOf('day')
          .toMillis();
        const order = await fetchListing(orderId);
        const orderListing = Listing(order);
        const listingGetter = Listing(listing);

        const {
          plans = [],
          quotationId,
          companyId,
        } = orderListing.getMetadata();
        const { title: orderTitle } = orderListing.getAttributes();
        const restaurantId = listingGetter.getId();
        const generalNotificationData = {
          orderId,
          orderTitle,
          planId: plans[0],
          subOrderDate: startTimestamp,
        };

        if (transition === ETransition.START_DELIVERY) {
          participantIds.map(async (participantId: string) => {
            createFirebaseDocNotification(ENotificationType.ORDER_DELIVERING, {
              ...generalNotificationData,
              userId: participantId,
            });
          });
        }
        if (transition === ETransition.COMPLETE_DELIVERY) {
          participantIds.map(async (participantId: string) => {
            createFirebaseDocNotification(ENotificationType.ORDER_SUCCESS, {
              ...generalNotificationData,
              userId: participantId,
            });
          });
        }
        if (transition === ETransition.OPERATOR_CANCEL_PLAN) {
          const plan = await fetchListing(plans[0]);
          const planListing = Listing(plan);
          const { orderDetail } = planListing.getMetadata();
          const newOrderDetail = {
            ...orderDetail,
            [startTimestamp]: {
              ...orderDetail[startTimestamp],
              status: 'canceled',
            },
          };

          await integrationSdk.listings.update({
            id: plans[0],
            metadata: {
              orderDetail: newOrderDetail,
            },
          });
          await emailSendingFactory(
            EmailTemplateTypes.BOOKER.BOOKER_SUB_ORDER_CANCELED,
            {
              orderId,
              timestamp,
            },
          );
          await Promise.all(
            participantIds.map(async (participantId: string) => {
              await emailSendingFactory(
                EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED,
                {
                  orderId,
                  timestamp,
                  participantId,
                },
              );
            }),
          );

          await emailSendingFactory(
            EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
            {
              orderId,
              timestamp,
              restaurantId,
            },
          );
          const quotation = await fetchListing(quotationId);
          const quotationListing = Listing(quotation);
          const { client, partner } = quotationListing.getMetadata();
          const newClient = {
            ...client,
            quotation: omit(client.quotation, [startTimestamp]),
          };
          const newPartner = {
            ...partner,
            [restaurantId]: {
              quotation: omit(partner[restaurantId].quotation, [
                startTimestamp,
              ]),
            },
          };
          await integrationSdk.listings.update({
            id: quotationId,
            metadata: {
              status: EQuotationStatus.INACTIVE,
            },
          });
          await createQuotation({
            orderId,
            companyId,
            client: newClient,
            partner: newPartner,
          });

          participantIds.map(async (participantId: string) => {
            createFirebaseDocNotification(ENotificationType.ORDER_CANCEL, {
              ...generalNotificationData,
              userId: participantId,
            });
          });
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
