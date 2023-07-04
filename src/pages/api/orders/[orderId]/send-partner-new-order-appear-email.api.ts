import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { orderId, partner } = req.body;
  try {
    const restaurantIds = uniq(Object.keys(partner));
    await Promise.all(
      restaurantIds.map(async (restaurantId: string) => {
        await emailSendingFactory(
          EmailTemplateTypes.PARTNER.PARTNER_NEW_ORDER_APPEAR,
          {
            orderId,
            restaurantId,
          },
        );
      }),
    );

    return res.end();
  } catch (error) {
    // Return error
    console.error('Send partner new order appear email error: ', orderId);
    handleError(res, error);
  }
}

export default cookies(handler);
