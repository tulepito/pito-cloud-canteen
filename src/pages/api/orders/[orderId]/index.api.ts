import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TObject } from '@utils/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();

  const apiMethod = req.method;
  switch (apiMethod) {
    case 'GET':
      try {
        const { orderId } = req.query;
        const orderResponse = await integrationSdk.listings.show({
          id: orderId,
        });
        const [orderListing] = denormalisedResponseEntities(orderResponse);
        const {
          plans = [],
          companyId,
          participants = [],
        } = Listing(orderListing).getMetadata();

        const companyResponse = await integrationSdk.users.show({
          id: companyId,
        });
        const [companyUser] = denormalisedResponseEntities(companyResponse);

        let data: TObject = { companyId, companyData: companyUser };
        const participantData = await Promise.all(
          participants.map(async (id: string) => {
            const [memberAccount] = denormalisedResponseEntities(
              await integrationSdk.users.show({
                id,
              }),
            );

            return memberAccount;
          }),
        );

        data = { ...data, participantData };

        if (plans?.length > 0) {
          const planId = plans[0];
          const [planListing] = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: planId,
            }),
          );

          data = { ...data, orderListing, planListing };
        }

        res.json({ statusCode: 200, ...data });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'POST':
      try {
        const {
          query: { orderId },
          body: { data },
        } = req;
        await integrationSdk.listings.update({
          id: orderId,
          ...data,
        });

        res.json({
          statusCode: 200,
          message: `Successfully update order info, orderId: ${orderId}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
    default:
      break;
  }
}

export default cookies(handler);
