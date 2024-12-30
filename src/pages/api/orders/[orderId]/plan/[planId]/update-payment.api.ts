import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { CustomError } from '@apis/errors';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import updatePayment from './update-payment.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT: {
        const { orderId, planId } = req.query;

        if (isEmpty(orderId) || isEmpty(planId)) {
          return handleError(
            res,
            new CustomError('Missing orderId or planId', 400),
          );
        }

        const response = await updatePayment(
          orderId as string,
          planId as string,
        );

        return res.status(200).json(response);
      }

      default:
        return handleError(res, new CustomError('Method not allowed', 405));
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
