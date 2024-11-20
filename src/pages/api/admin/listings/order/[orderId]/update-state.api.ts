import type { NextApiRequest, NextApiResponse } from 'next';

import updateOrder from '@pages/api/orders/[orderId]/update.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { ORDER_STATE_TRANSIT_FLOW } from '@src/utils/constants';
import { Listing } from '@src/utils/data';
import type { TTransitionOrderState } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { orderId } = req.query;
    const { orderState: newOrderState } = req.body;

    const order = await fetchListing(orderId as string);
    const orderListing = Listing(order);
    const { orderState: currentOrderState, orderStateHistory = [] } =
      orderListing.getMetadata();

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

      return res.status(200).json(updatedOrder);
    }

    return res.status(500).json({
      error: 'Invalid order state',
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
