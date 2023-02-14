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
}: {
  companyId: string;
  bookerId: string;
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

  // Call api to create order listing
  const orderListinResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderId,
      state: EListingStates.published,
      metadata: {
        companyId,
        bookerId,
        listingType: ListingTypes.ORDER,
        orderState: EOrderStates.isNew,
      },
    },
    { expand: true },
  );

  return denormalisedResponseEntities(orderListinResponse)[0];
};

export default createOrder;
