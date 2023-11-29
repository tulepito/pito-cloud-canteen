const config = require('../utils/config');
const {
  generateUncountableIdForQuotation,
} = require('../utils/generateUncountableId');
const { fetchListing, fetchUser } = require('../utils/integrationHelper');
const getIntegrationSdk = require('../utils/integrationSdk');
const {
  denormalisedResponseEntities,
  Listing,
  User,
} = require('../utils/data');

const ADMIN_ID = config.adminId;

const createQuotation = async (params) => {
  const { companyId, orderId } = params;
  const integrationSdk = getIntegrationSdk();

  // TODO: get current and update new quotation number
  const admin = await fetchUser(ADMIN_ID);
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
      state: 'published',
      metadata: {
        ...params,
        status: 'active',
        listingType: 'quotation',
      },
    },
    { expand: true },
  );

  const quotation = denormalisedResponseEntities(quotationResponse)[0];
  console.info('💫 > created');
  console.info(quotation);

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

module.exports = { createQuotation };
