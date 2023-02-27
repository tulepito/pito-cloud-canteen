import getAdminAccount from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingStates, EOrderStates } from '@utils/enums';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const createOrder = async ({
  companyId,
  bookerId,
  generalInfo = {},
}: {
  companyId: string;
  bookerId: string;
  generalInfo?: any;
}) => {
  const integrationSdk = getIntegrationSdk();

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
  } = generalInfo;

  // Call api to create order listing
  const orderListingResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderId,
      state: EListingStates.published,
      metadata: {
        companyId,
        bookerId,
        listingType: ListingTypes.ORDER,
        orderState: EOrderStates.isNew,
        deliveryAddress,
        deliveryHour,
        deadlineHour,
        nutritions,
        selectedGroups,
        packagePerMember,
        dayInWeek,
        startDate,
        endDate,
      },
    },
    { expand: true },
  );

  return denormalisedResponseEntities(orderListingResponse)[0];
};

export default createOrder;
