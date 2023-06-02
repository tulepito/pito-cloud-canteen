import uniq from 'lodash/uniq';

import type { TCreateQuotationApiBody } from '@apis/orderApi';
import { generateUncountableIdForQuotation } from '@helpers/generateUncountableId';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, User } from '@src/utils/data';
import { EListingStates, EListingType } from '@src/utils/enums';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const createQuotation = async (params: TCreateQuotationApiBody) => {
  const { companyId, orderId, partner } = params;
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

  const quotation = denormalisedResponseEntities(quotationResponse)[0];

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      quotationId: quotation.id.uuid,
    },
  });

  const restaurantIds = uniq(Object.keys(partner));

  await Promise.all(
    restaurantIds.map(async (restaurantId: string) => {
      await emailSendingFactory(
        EmailTemplateTypes.PARTNER.PARTNER_NEW_ORDER_APPEAR,
        {
          orderId,
          restaurantId,
        },
      );
    }),
  );

  return quotation;
};

export default createQuotation;
