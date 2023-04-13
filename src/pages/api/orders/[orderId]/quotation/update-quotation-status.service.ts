import { getIntegrationSdk } from '@services/integrationSdk';

const updateQuotationStatus = async (quotationId: string) => {
  const integrationSdk = getIntegrationSdk();

  await integrationSdk.listings.update({
    id: quotationId,
    metadata: {
      status: 'inactive',
    },
  });
};

export default updateQuotationStatus;
