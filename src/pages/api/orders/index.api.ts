import { calculateGroupMembers } from '@helpers/companyMembers';
import getAdminAccount from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { getSubAccountSdk } from '@services/subAccountSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import { EOrderStates } from '@utils/enums';
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
        const { companyId, generalInfo, orderDetail } = req.body;
        const { selectedGroups } = generalInfo;
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
        const loggedinSubAccount = await getSubAccountSdk(subCompanyAccount);
        const generatedOrderId = `PT${(currentOrderNumber + 1)
          .toString()
          .padStart(5, '0')}`;
        const draftedOrderListinResponse =
          await loggedinSubAccount.ownListings.createDraft({
            title: generatedOrderId,
            publicData: {
              orderName: `${
                companyAccount.attributes.profile.displayName
              } PCC_${parseTimestampToFormat(
                generalInfo.startDate,
              )} - ${parseTimestampToFormat(generalInfo.endDate)}`,
              startDate: generalInfo.startDate,
              enddate: generalInfo.endDate,
            },
          });
        const draftedOrderListing = denormalisedResponseEntities(
          draftedOrderListinResponse,
        )[0];
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
        const updatedDraftOrderListingResponse =
          await integrationSdk.listings.update({
            id: draftedOrderListing.id.uuid,
            metadata: {
              companyId,
              participants: allMembers,
              listingType: ListingTypes.ORDER,
              generalInfo,
              orderDetail: updatedOrderDetail,
              orderState: EOrderStates.isNew,
            },
          });
        const updatedDraftOrderListing = denormalisedResponseEntities(
          updatedDraftOrderListingResponse,
        )[0];
        res.json({ data: updatedDraftOrderListing });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.PUT:
      break;
    case HTTP_METHODS.DELETE:
      break;

    default:
      break;
  }
};

export default handler;
