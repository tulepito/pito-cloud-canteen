import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import orderServices from '@pages/api/apiServices/order/index.service';
import cookies from '@services/cookie';
import { getCurrentUser, handleError } from '@services/sdk';
import { User } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.POST: {
        const { orderId } = req.query;
        const { currentUser: booker } = await getCurrentUser(req, res);
        const response = await orderServices.reorder(
          orderId as string,
          User(booker).getId(),
        );

        return res.status(200).json(response);
      }

      default:
        return res.status(200).json('Method is not allowed');
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
