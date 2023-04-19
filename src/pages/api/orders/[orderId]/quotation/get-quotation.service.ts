import { fetchListing } from '@services/integrationHelper';
import { denormalisedResponseEntities } from '@src/utils/data';

const getQuotation = async (quotationId: string) => {
  const quotation = await fetchListing(quotationId);

  return denormalisedResponseEntities(quotation)[0];
};

export default getQuotation;
