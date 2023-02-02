import { calculateGroupMembers } from '@helpers/companyMembers';
import cookies from '@services/cookie';
import getAdminAccount from '@services/getAdminAccount';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import orderChecker from '@services/permissionChecker/order';
import { handleError } from '@services/sdk';
import subAccountLogin from '@services/subAccountLogin';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, LISTING } from '@utils/data';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_METHODS } from '../helpers/constants';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      break;
    case HTTP_METHODS.POST:
      try {
        const { companyId, bookerId } = req.body;
        const adminAccount = await getAdminAccount();
        const { currentOrderNumber = 0 } =
          adminAccount.attributes.profile.metadata;
        await integrationSdk.users.updateProfile({
          id: ADMIN_ID,
          metadata: {
            currentOrderNumber: currentOrderNumber + 1,
          },
        });
        const companyAccount = await fetchUser(companyId);
        const { subAccountId } = companyAccount.attributes.profile.privateData;
        const subCompanyAccount = await fetchUser(subAccountId);
        const loggedinSubAccount = await subAccountLogin(subCompanyAccount);
        const generatedOrderId = `PT${(currentOrderNumber + 1)
          .toString()
          .padStart(5, '0')}`;
        const draftedOrderListinResponse =
          await loggedinSubAccount.ownListings.create({
            title: generatedOrderId,
          });
        const draftedOrderListing = denormalisedResponseEntities(
          draftedOrderListinResponse,
        )[0];
        const updatedDraftOrderListingResponse =
          await integrationSdk.listings.update(
            {
              id: draftedOrderListing.id.uuid,
              metadata: {
                companyId,
                bookerId,
                listingType: ListingTypes.ORDER,
                orderState: 'draft',
              },
            },
            { expand: true },
          );
        const updatedDraftOrderListing = denormalisedResponseEntities(
          updatedDraftOrderListingResponse,
        )[0];
        res.json(updatedDraftOrderListing);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.PUT:
      try {
        const { orderId, generalInfo, orderDetail } = req.body;
        const orderListing = await fetchListing(orderId);
        const {
          companyId,
          plans = [],
          selectedGroups = [],
        } = LISTING(orderListing).getMetadata();
        const companyAccount = await fetchUser(companyId);
        const { subAccountId } = companyAccount.attributes.profile.privateData;

        const subCompanyAccount = await fetchUser(subAccountId);
        const loggedinSubAccount = await subAccountLogin(subCompanyAccount);
        let updatedOrderListing;
        if (!isEmpty(generalInfo)) {
          // eslint-disable-next-line prefer-destructuring
          updatedOrderListing = denormalisedResponseEntities(
            await integrationSdk.listings.update(
              {
                id: orderId,
                metadata: {
                  ...generalInfo,
                },
              },
              { expand: true },
            ),
          )[0];
        }
        if (orderDetail) {
          const allMembers = calculateGroupMembers(
            companyAccount,
            selectedGroups,
          );
          const initialMemberOrder = allMembers.reduce(
            (result: any, _memberId: any) => ({
              ...result,
              [_memberId]: {
                foodId: '',
                status: 'empty',
              },
            }),
            {},
          );
          const updatedOrderDetail = Object.keys(orderDetail).reduce(
            (result, date) => {
              return {
                ...result,
                [date]: {
                  ...orderDetail[date],
                  memberOrders: initialMemberOrder,
                },
              };
            },
            {},
          );

          const orderTitle = orderListing.attributes.title;
          const planListingResponse =
            await loggedinSubAccount.ownListings.create({
              title: `${orderTitle} - Plan week ${plans.length + 1}`,
            });

          const planListing =
            denormalisedResponseEntities(planListingResponse)[0];
          await integrationSdk.listings.update({
            id: planListing.id.uuid,
            metadata: {
              orderDetail: updatedOrderDetail,
              orderId,
              listingType: ListingTypes.PLAN,
            },
          });

          // eslint-disable-next-line prefer-destructuring
          updatedOrderListing = denormalisedResponseEntities(
            await integrationSdk.listings.update(
              {
                id: orderListing.id.uuid,
                metadata: {
                  plans: plans.concat(planListing.id.uuid),
                },
              },
              { expand: true },
            ),
          )[0];
        }
        res.json(updatedOrderListing);
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

export default cookies(orderChecker(handler));
