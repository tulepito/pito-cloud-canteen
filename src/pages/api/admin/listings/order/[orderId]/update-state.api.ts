import type { NextApiRequest, NextApiResponse } from 'next';

import { orderFlow } from '@helpers/orderHelper';
import updateOrder from '@pages/api/orders/[orderId]/update.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import type {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@src/utils/enums';

type TOrderState =
  | EOrderDraftStates.draft
  | EBookerOrderDraftStates.bookerDraft
  | EOrderDraftStates.pendingApproval
  | EOrderStates.picking
  | EOrderStates.inProgress
  | EOrderStates.pendingPayment
  | EOrderStates.completed;

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { orderId } = req.query;
    const { orderState: newOrderState } = req.body;

    const order = await fetchListing(orderId as string);
    const orderListing = Listing(order);
    const currentOrderState = orderListing.getMetadata()
      ?.orderState as TOrderState;

    if (orderFlow?.[currentOrderState].includes(newOrderState)) {
      const generalInfo = {
        orderState: newOrderState,
      };

      const { data: updatedOrder } = await updateOrder({
        orderId: orderId as string,
        generalInfo,
      });

      res.status(200).json(updatedOrder);
    } else {
      res.status(500).json({
        error: 'Invalid order state',
      });
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
