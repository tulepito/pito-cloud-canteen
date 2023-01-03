import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getIntegrationSdk } from '../../../../services/integrationSdk';
import { getSdk, handleError } from '../../../../services/sdk';
import { HTTP_METHODS, LISTING_TYPE } from '../../helpers/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();
  const sdk = getSdk(req, res);

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      {
        const { orderId } = req.query;
        if (!orderId) {
          return res.status(400).json({
            message: 'Missing required keys',
          });
        }

        try {
          // const currentUserId = '63a51b42-84f2-4520-800f-6c7680189803';
          // const participant = denormalisedResponseEntities(
          //   await integrationSdk.users.show({ id: currentUserId }),
          // );

          // Get order data
          const order = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: orderId,
            }),
          )[0];

          // Get company data (user)
          const companyId = order?.attributes.metadata?.companyId || '';
          const company = denormalisedResponseEntities(
            await integrationSdk.users.show(
              { id: companyId },
              {
                expand: true,
                include: ['profileImage'],
                'fields.image': [
                  'variants.square-small',
                  'variants.square-small2x',
                ],
              },
            ),
          )[0];

          // Get list sub-order (plan)
          const planIds = order?.attributes.metadata?.plans || [];

          const plans = denormalisedResponseEntities(
            await integrationSdk.listings.query({
              ids: planIds.join(','),
              meta_listingType: LISTING_TYPE.SUB_ORDER,
            }),
          );

          const 

          res.json({
            status: 200,
            meta: {},
            data: {
              restaurant: {},
              company,
              order,
              plans,
            },
          });
        } catch (error) {
          handleError(res, error);
          console.log(error);
        }
      }
      break;
    default:
      break;
  }
};

export default handler;
