import type { TCreateQuotationApiBody } from '@apis/orderApi';
import { generateUncountableIdForQuotation } from '@helpers/generateUncountableId';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing, User } from '@src/utils/data';
import { EListingStates, EListingType } from '@src/utils/enums';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const createQuotation = async (params: TCreateQuotationApiBody) => {
  const { companyId, orderId } = params;
  const integrationSdk = getIntegrationSdk();

  // TODO: get current and update new quotation number
  const admin = await fetchUser(ADMIN_ID as string);
  const { quotationIdNumber = 0 } = User(admin).getMetadata();
  await integrationSdk.users.updateProfile({
    id: ADMIN_ID,
    metadata: {
      quotationIdNumber: quotationIdNumber + 1,
    },
  });

  const order = await fetchListing(orderId);
  const orderListing = Listing(order);
  const { quotationId: oldQuotationId } = orderListing.getMetadata();

  const companyAccount = await fetchUser(companyId);
  const { subAccountId } = companyAccount.attributes.profile.privateData;

  const quotationResponse = await integrationSdk.listings.create(
    {
      title: generateUncountableIdForQuotation(quotationIdNumber),
      authorId: subAccountId,
      state: EListingStates.published,
      metadata: {
        ...params,
        status: 'active',
        listingType: EListingType.quotation,
      },
    },
    { expand: true },
  );

  const quotation = denormalisedResponseEntities(quotationResponse)[0];

  // TODO: inactive old quotation listing
  if (oldQuotationId) {
    integrationSdk.listings.update({
      id: oldQuotationId,
      metadata: {
        status: 'inactive',
      },
    });
  }

  // TODO: update new listing quotation ID
  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      quotationId: quotation.id.uuid,
    },
  });

  return quotation;
};

export default createQuotation;
