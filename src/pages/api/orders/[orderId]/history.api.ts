import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import orderServices from '@pages/api/apiServices/order/index.service';
import cookies from '@services/cookie';
import { getCurrentUser, handleError } from '@services/sdk';
import { CurrentUser } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.POST: {
        try {
          const { orderId } = req.query;
          const createData = req.body;
          const { currentUser } = await getCurrentUser(req, res);
          const createdAt = createData?.createdAt
            ? new Date(createData.createdAt)
            : new Date();
          const response =
            await orderServices.createOrderHistoryRecordToFirestore({
              orderId,
              authorId: CurrentUser(currentUser).getId(),
              ...createData,
              createdAt,
            });

          return res.status(200).json(response);
        } catch (error) {
          console.error(
            '/orders/[orderId]/plan/[planId]/history error:',
            error,
          );

          return res.status(500).json(error);
        }
      }

      default:
        return res.status(400).json('Method is not allowed');
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
