import type { TCreateQuotationApiBody } from '@apis/orderApi';
import { generateUncountableIdForQuotation } from '@helpers/generateUncountableId';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, User } from '@src/utils/data';
import { EListingStates, EListingType } from '@src/utils/enums';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const createQuotation = async (params: TCreateQuotationApiBody) => {
  const { companyId, orderId } = params;
  const integrationSdk = getIntegrationSdk();
  const admin = await fetchUser(ADMIN_ID as string);
  const adminUser = User(admin);
  const { quotationIdNumber = 0 } = adminUser.getMetadata();
  await integrationSdk.users.updateProfile({
    id: ADMIN_ID,
    metadata: {
      quotationIdNumber: quotationIdNumber + 1,
    },
  });

  const companyAccount = await fetchUser(companyId);
  const { subAccountId } = companyAccount.attributes.profile.privateData;

  const quotationId = generateUncountableIdForQuotation(quotationIdNumber);

  const quotationResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: quotationId,
      state: EListingStates.published,
      metadata: {
        ...params,
        status: 'active',
        listingType: EListingType.quotation,
      },
    },
    { expand: true },
  );

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      quotationId,
    },
  });

  return denormalisedResponseEntities(quotationResponse)[0];
};

export default createQuotation;
