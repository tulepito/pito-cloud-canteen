import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import cookies from '@services/cookie';
import getAdminAccount from '@services/getAdminAccount';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import orderChecker from '@services/permissionChecker/order';
import { handleError } from '@services/sdk';
import { getSubAccountSdk } from '@services/subAccountSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import { EListingStates, EOrderStates } from '@utils/enums';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_METHODS } from '../helpers/constants';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const integrationSdk = getIntegrationSdk();
  const apiMethod = req.method;

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      break;

    case HTTP_METHODS.POST:
      try {
        const { companyId, bookerId, isCreatedByAdmin } = req.body;
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
        const loggedInSubAccount = await getSubAccountSdk(subCompanyAccount);
        const generatedOrderId = `PT${(currentOrderNumber + 1)
          .toString()
          .padStart(5, '0')}`;

        const draftedOrderListingResponse =
          await loggedInSubAccount.ownListings.create({
            title: generatedOrderId,
            // TODO: if api is called by admin account, create a listing need approval (by booker).
            state: isCreatedByAdmin
              ? EListingStates.pendingApproval
              : EListingStates.published,
          });

        const draftedOrderListing = denormalisedResponseEntities(
          draftedOrderListingResponse,
        )[0];
        const updatedDraftOrderListingResponse =
          await integrationSdk.listings.update(
            {
              id: draftedOrderListing.id.uuid,
              metadata: {
                companyId,
                bookerId,
                listingType: ListingTypes.ORDER,
                orderState: EOrderStates.isNew,
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
        const { orderId, generalInfo, orderDetail = {} } = req.body;
        const orderListing = await fetchListing(orderId);
        const {
          companyId,
          plans = [],
          selectedGroups = [],
          orderState,
        } = Listing(orderListing).getMetadata();
        const companyAccount = await fetchUser(companyId);
        const { subAccountId } = companyAccount.attributes.profile.privateData;
        const enabledToUpdateRelatedBookingInfo =
          orderState === EOrderStates.isNew;

        let updatedOrderListing;

        if (!isEmpty(generalInfo)) {
          const newSelectedGroup = generalInfo.selectedGroups || selectedGroups;
          const participants: string[] = isEmpty(newSelectedGroup)
            ? getAllCompanyMembers(companyAccount)
            : calculateGroupMembers(companyAccount, selectedGroups);

          const { startDate, endDate } = generalInfo;
          const companyDisplayName =
            companyAccount.attributes.profile.displayName;

          const shouldUpdateOrderName =
            companyDisplayName && startDate && endDate;
          // eslint-disable-next-line prefer-destructuring
          updatedOrderListing = denormalisedResponseEntities(
            await integrationSdk.listings.update(
              {
                id: orderId,
                ...(shouldUpdateOrderName
                  ? {
                      publicData: {
                        orderName: `${
                          companyAccount.attributes.profile.displayName
                        } PCC ${parseTimestampToFormat(
                          generalInfo.startDate,
                        )} - ${parseTimestampToFormat(generalInfo.endDate)}`,
                      },
                    }
                  : {}),
                metadata: {
                  ...generalInfo,
                  ...(enabledToUpdateRelatedBookingInfo
                    ? { participants }
                    : {}),
                },
              },
              { expand: true },
            ),
          )[0];
        }

        // TODO: Check plan list is empty, create new plan, else, update plan existed instead.
        if (!isEmpty(orderDetail) && enabledToUpdateRelatedBookingInfo) {
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

          // TODO: Check plan list is empty, create new plan, else, update plan existed instead.
          if (isEmpty(plans)) {
            const orderTitle = orderListing.attributes.title;
            const planListingResponse = await integrationSdk.listings.create({
              authorId: subAccountId,
              title: `${orderTitle} - Plan week ${plans.length + 1}`,
              state: 'published',
              metadata: {
                orderDetail: updatedOrderDetail,
                orderId,
                listingType: ListingTypes.PLAN,
              },
            });
            const planListing =
              denormalisedResponseEntities(planListingResponse)[0];

            // eslint-disable-next-line prefer-destructuring
            updatedOrderListing = denormalisedResponseEntities(
              await integrationSdk.listings.update(
                {
                  id: orderId,
                  metadata: {
                    plans: plans.concat(planListing.id.uuid),
                  },
                },
                { expand: true },
              ),
            )[0];
          } else {
            const [planId] = plans;

            if (planId) {
              await integrationSdk.listings.update({
                id: planId,
                metadata: {
                  orderDetail: updatedOrderDetail,
                },
              });
            }
          }
        }
        res.json(updatedOrderListing);
      } catch (error) {
        console.log('initiate transactions error : ', error);
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
