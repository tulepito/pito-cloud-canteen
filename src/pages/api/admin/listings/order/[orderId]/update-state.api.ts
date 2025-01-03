import type { NextApiRequest, NextApiResponse } from 'next';

import logger from '@helpers/logger';
import updateOrder from '@pages/api/orders/[orderId]/update.service';
import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { ORDER_STATE_TRANSIT_FLOW } from '@src/utils/constants';
import { Listing } from '@src/utils/data';
import { EOrderStates } from '@src/utils/enums';
import type { TTransitionOrderState } from '@src/utils/types';

export interface POSTUpdateStateBody {
  orderState: EOrderStates;
  options?: {
    triggerRemindingPickingEmail: boolean;
  };
}

export type UpdateStateParams = {
  orderId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { orderId } = req.query as UpdateStateParams;
    const { orderState: newOrderState, options } =
      req.body as POSTUpdateStateBody;

    const order = await fetchListing(orderId);
    const orderListing = Listing(order);
    const {
      orderState: currentOrderState,
      participants,
      orderStateHistory = [],
    } = orderListing.getMetadata();

    if (
      ORDER_STATE_TRANSIT_FLOW[
        currentOrderState as TTransitionOrderState
      ].includes(newOrderState)
    ) {
      const generalInfo = {
        isAutoPickFood: false,
        orderState: newOrderState,
        orderStateHistory: orderStateHistory.concat({
          state: newOrderState,
          updatedAt: new Date().getTime(),
        }),
      };

      const updatedOrder = await updateOrder({
        orderId: orderId as string,
        generalInfo,
      });

      if (
        newOrderState === EOrderStates.picking &&
        options?.triggerRemindingPickingEmail
      ) {
        participants.forEach(async (participantId: string) => {
          emailSendingFactory(
            EmailTemplateTypes.PARTICIPANT.PARTICIPANT_ORDER_PICKING,
            {
              orderId,
              participantId,
            },
          );
        });
      }

      return res.status(200).json(updatedOrder);
    }

    return res.status(500).json({
      error: 'Invalid order state',
    });
  } catch (error) {
    logger.error('Error updating order state', String(error));
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
