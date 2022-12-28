import getAdminAccount from '@services/getAdminAccount';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import subAccountLogin from '@services/subAccountLogin';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import type { TOrder, TPlan } from '@utils/orderTypes';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_METHODS } from '../helpers/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      break;
    case HTTP_METHODS.POST:
      try {
        const { companyId, ...rest } = req.body;
        const adminAccount = await getAdminAccount();

        const { sequenceId } = adminAccount.attributes.profile.metadata;
        const companyAccountResponse = await integrationSdk.users.show(
          { id: companyId },
          { expand: true },
        );
        const companyAccount = denormalisedResponseEntities(
          companyAccountResponse,
        )[0];
        const { subAccountId } = companyAccount.attributes.profile.privateData;

        const subCompanyAccountResponse = await integrationSdk.users.show(
          { id: subAccountId },
          { expand: true },
        );
        const subCompanyAccount = denormalisedResponseEntities(
          subCompanyAccountResponse,
        )[0];
        const loggedinSubAccount = await subAccountLogin(subCompanyAccount);

        const generatedOrderId = `PT${(sequenceId + 1)
          .toString()
          .padStart(5, '0')}`;
        const draftedOrderListinResponse =
          await loggedinSubAccount.ownListings.createDraft({
            title: generatedOrderId,
          });
        const draftedOrderListing = denormalisedResponseEntities(
          draftedOrderListinResponse,
        )[0];
        const updatedDraftOrderListingResponse = integrationSdk.listings.update(
          {
            id: draftedOrderListing.id.uuid,
            metadata: {
              companyId,
              listingType: ListingTypes.ORDER,
              generalInfo: {
                ...rest,
              },
            },
          },
        );
        const updatedDraftOrderListing = denormalisedResponseEntities(
          updatedDraftOrderListingResponse,
        )[0];
        res.json({ data: updatedDraftOrderListing });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.PUT:
      try {
        const { orderId, planId } = req.body;
        const orderListingResponse = await integrationSdk.listings.show({
          id: orderId,
        });
        const orderListing =
          denormalisedResponseEntities(orderListingResponse)[0];
        const { order }: { order: TOrder } = orderListing.attributes.metadata;
        const { companyId } = order;
        const companyAccountResponse = await integrationSdk.users.show(
          { id: companyId },
          { expand: true },
        );
        const companyAccount = denormalisedResponseEntities(
          companyAccountResponse,
        )[0];
        const { subAccountId } = companyAccount.attributes.profile.privateData;

        const subCompanyAccountResponse = await integrationSdk.users.show(
          { id: subAccountId },
          { expand: true },
        );
        const subCompanyAccount = denormalisedResponseEntities(
          subCompanyAccountResponse,
        )[0];
        const loggedinSubAccount = await subAccountLogin(subCompanyAccount);
        const planListingResponse =
          await loggedinSubAccount.ownListings.publishDraft(
            {
              id: planId,
            },
            { expand: true },
          );
        const planListing =
          denormalisedResponseEntities(planListingResponse)[0];
        const { metadata: plan }: { metadata: TPlan } = planListing.attributes;
        const { orderDetail } = plan;
        const allTsxResponse = await Promise.all(
          Object.keys(orderDetail).map(async (orderItem) => {
            const body = {
              processAlias: 'sharetribe-flex/release-1',
              transition: 'transition/request',
            };
            const params = {
              listingId: orderDetail[orderItem].restaurant,
            };
            const transactionResponse =
              await loggedinSubAccount.transactions.initiate(
                {
                  ...body,
                  params,
                },
                { expand: true },
              );
            return denormalisedResponseEntities(transactionResponse)[0];
          }),
        );
        res.json(allTsxResponse);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.DELETE:
      break;

    default:
      break;
  }
};

export default handler;
