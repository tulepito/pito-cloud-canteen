import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import subAccountLogin from '@services/subAccountLogin';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import type { TOrder } from '@utils/orderTypes';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();
  switch (apiMethod) {
    case 'GET':
      break;
    case 'POST':
      try {
        const { orderId, ...rest } = req.body;
        const { meal, orderDetail } = rest;

        const orderListing = await fetchListing(orderId);
        const orderTitle = orderListing.attributes.title;
        const { metadata }: { metadata: TOrder } = orderListing.attributes;

        const { companyId, plans = [] } = metadata;
        const companyAccount = await fetchUser(companyId);

        const { subAccountId } = companyAccount.attributes.profile.privateData;
        const subCompanyAccount = await fetchUser(subAccountId);
        const loggedinSubAccount = await subAccountLogin(subCompanyAccount);
        const planListingResponse =
          await loggedinSubAccount.ownListings.createDraft({
            title: `${orderTitle} - Plan week ${plans.length + 1}`,
          });

        const planListing =
          denormalisedResponseEntities(planListingResponse)[0];
        await integrationSdk.listings.update({
          id: planListing.id.uuid,
          metadata: {
            meal,
            orderDetail,
            orderId,
            listingType: ListingTypes.PLAN,
          },
        });

        await integrationSdk.listings.update({
          id: orderListing.id.uuid,
          metadata: {
            ...metadata,
            plans: plans.concat(planListing.id.uuid),
          },
        });
        res.json(planListing);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'PUT':
      try {
        const { planId, orderDetail } = req.body;

        const currentPlanListing = await fetchListing(planId);
        const { orderId } = currentPlanListing.attributes.metadata;

        const orderListing = await fetchListing(orderId);
        const { companyId } = orderListing.attributes.metadata;

        const companyAccount = await fetchUser(companyId);
        const { subAccountId } = companyAccount.attributes.profile.privateData;

        const subCompanyAccount = await fetchUser(subAccountId);
        const loggedinSubAccount = await subAccountLogin(subCompanyAccount);
        await loggedinSubAccount.ownListings.publishDraft({
          id: planId,
        });
        const planListingResponse = await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail,
          },
        });
        const planListing =
          denormalisedResponseEntities(planListingResponse)[0];
        res.json(planListing);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'DELETE':
      break;

    default:
      break;
  }
};
export default handler;
