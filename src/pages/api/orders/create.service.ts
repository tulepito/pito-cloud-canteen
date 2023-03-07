import { isEmpty } from 'lodash';

import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import getAdminAccount from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EListingStates,
  EOrderDraftStates,
} from '@utils/enums';
import type { TObject } from '@utils/types';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const createOrder = async ({
  companyId,
  bookerId,
  isCreatedByAdmin,
  generalInfo = {},
}: {
  companyId: string;
  bookerId: string;
  isCreatedByAdmin: boolean;
  generalInfo?: TObject;
}) => {
  const integrationSdk = getIntegrationSdk();
  const updatedAt = new Date().getTime();

  // Count order number
  const adminAccount = await getAdminAccount();

  const { currentOrderNumber = 0 } = adminAccount.attributes.profile.metadata;
  await integrationSdk.users.updateProfile({
    id: ADMIN_ID,
    metadata: {
      currentOrderNumber: currentOrderNumber + 1,
    },
  });

  // Get sub account id
  const companyAccount = await fetchUser(companyId);

  const { subAccountId } = companyAccount.attributes.profile.privateData;

  const generatedOrderId = `PT${(currentOrderNumber + 1)
    .toString()
    .padStart(5, '0')}`;

  // Prepare order state history
  const orderStateHistory = [
    {
      state: isCreatedByAdmin
        ? EOrderDraftStates.draft
        : EBookerOrderDraftStates.bookerDraft,
      updatedAt,
    },
  ];

  // Prepare general info
  const {
    deliveryAddress,
    deliveryHour,
    deadlineHour,
    nutritions,
    selectedGroups,
    packagePerMember,
    dayInWeek,
    startDate,
    endDate,
    memberAmount,
    deadlineDate,
  } = generalInfo;

  const participants: string[] = isEmpty(selectedGroups)
    ? getAllCompanyMembers(companyAccount)
    : calculateGroupMembers(companyAccount, selectedGroups);

  // Call api to create order listing
  const orderListingResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderId,
      state: EListingStates.published,
      metadata: {
        companyId,
        bookerId,
        memberAmount,
        listingType: ListingTypes.ORDER,
        orderState: isCreatedByAdmin
          ? EOrderDraftStates.draft
          : EBookerOrderDraftStates.bookerDraft,
        orderStateHistory,
        deliveryAddress,
        deliveryHour,
        deadlineDate,
        deadlineHour,
        nutritions,
        selectedGroups,
        packagePerMember,
        dayInWeek,
        startDate,
        endDate,
        participants,
      },
    },
    { expand: true },
  );

  return denormalisedResponseEntities(orderListingResponse)[0];
};

export default createOrder;
