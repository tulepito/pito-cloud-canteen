import type { NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { User } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { orderId } = req.query;
    const { restaurantId, timestamp } = req.body;
    const integrationSdk = getIntegrationSdk();
    const [restaurant] = denormalisedResponseEntities(
      await integrationSdk.listings.show(
        {
          id: restaurantId,
          include: ['author'],
        },
        { expand: true },
      ),
    );

    const partnerId = User(restaurant?.author).getId();

    await emailSendingFactory(
      EmailTemplateTypes.PARTNER.PARTNER_ORDER_DETAILS_UPDATED,
      {
        orderId,
        partnerId,
        restaurantId,
        timestamp,
      },
    );

    return res.send({ message: 'Success' });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
